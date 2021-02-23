export function createServiceContext(Vue, weex, plus, __uniConfig, __uniRoutes, UniServiceJSBridge,instanceContext){
var localStorage = plus.storage
var setTimeout = instanceContext.setTimeout
var clearTimeout = instanceContext.clearTimeout
var setInterval = instanceContext.setInterval
var clearInterval = instanceContext.clearInterval

var serviceContext = (function () {
  'use strict';

  function callHook (vm, hook, params) {
    return (vm.$vm || vm).__call_hook(hook, params)
  }

  function callAppHook (vm, hook, params) {
    if (hook !== 'onError') {
      console.debug(`App：${hook} have been invoked` + (params ? ` ${JSON.stringify(params)}` : ''));
    }
    return (vm.$vm || vm).__call_hook(hook, params)
  }

  function callPageHook (vm, hook, params) {
    if (hook !== 'onPageScroll') {
      console.debug(`${vm.$page.route}[${vm.$page.id}]：${hook} have been invoked`);
    }
    return callHook(vm, hook, params)
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var base64Arraybuffer = createCommonjsModule(function (module, exports) {
  /*
   * base64-arraybuffer
   * https://github.com/niklasvh/base64-arraybuffer
   *
   * Copyright (c) 2012 Niklas von Hertzen
   * Licensed under the MIT license.
   */
  (function(){

    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    // Use a lookup table to find the index.
    var lookup = new Uint8Array(256);
    for (var i = 0; i < chars.length; i++) {
      lookup[chars.charCodeAt(i)] = i;
    }

    exports.encode = function(arraybuffer) {
      var bytes = new Uint8Array(arraybuffer),
      i, len = bytes.length, base64 = "";

      for (i = 0; i < len; i+=3) {
        base64 += chars[bytes[i] >> 2];
        base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
        base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
        base64 += chars[bytes[i + 2] & 63];
      }

      if ((len % 3) === 2) {
        base64 = base64.substring(0, base64.length - 1) + "=";
      } else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2) + "==";
      }

      return base64;
    };

    exports.decode =  function(base64) {
      var bufferLength = base64.length * 0.75,
      len = base64.length, i, p = 0,
      encoded1, encoded2, encoded3, encoded4;

      if (base64[base64.length - 1] === "=") {
        bufferLength--;
        if (base64[base64.length - 2] === "=") {
          bufferLength--;
        }
      }

      var arraybuffer = new ArrayBuffer(bufferLength),
      bytes = new Uint8Array(arraybuffer);

      for (i = 0; i < len; i+=4) {
        encoded1 = lookup[base64.charCodeAt(i)];
        encoded2 = lookup[base64.charCodeAt(i+1)];
        encoded3 = lookup[base64.charCodeAt(i+2)];
        encoded4 = lookup[base64.charCodeAt(i+3)];

        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
      }

      return arraybuffer;
    };
  })();
  });
  var base64Arraybuffer_1 = base64Arraybuffer.encode;
  var base64Arraybuffer_2 = base64Arraybuffer.decode;

  function unpack (args) {
    return args
  }

  function invoke (...args) {
    return UniServiceJSBridge.invokeCallbackHandler(...args)
  }

  function requireNativePlugin (name) {
    return uni.requireNativePlugin(name)
  }

  /**
   * 触发 service 层，与 onMethod 对应
   */
  function publish (name, res) {
    return UniServiceJSBridge.emit('api.' + name, res)
  }

  let lastStatusBarStyle;

  function setStatusBarStyle (statusBarStyle) {
    if (!statusBarStyle) {
      const pages = getCurrentPages();
      if (!pages.length) {
        return
      }
      statusBarStyle = pages[pages.length - 1].$page.meta.statusBarStyle;
      if (!statusBarStyle || statusBarStyle === lastStatusBarStyle) {
        return
      }
    }
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[uni-app] setStatusBarStyle`, statusBarStyle);
    }

    lastStatusBarStyle = statusBarStyle;

    plus.navigator.setStatusBarStyle(statusBarStyle);
  }

  function isTabBarPage (path = '') {
    if (!(__uniConfig.tabBar && Array.isArray(__uniConfig.tabBar.list))) {
      return false
    }
    try {
      if (!path) {
        const pages = getCurrentPages();
        if (!pages.length) {
          return false
        }
        const page = pages[pages.length - 1];
        if (!page) {
          return false
        }
        return page.$page.meta.isTabBar
      }
      const route = __uniRoutes.find(route => route.path.slice(1) === path);
      return route && route.meta.isTabBar
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('getCurrentPages is not ready');
      }
    }
    return false
  }

  function base64ToArrayBuffer (data) {
    return base64Arraybuffer_2(data)
  }

  function arrayBufferToBase64 (data) {
    return base64Arraybuffer_1(data)
  }

  function callApiSync (api, args, name, alias) {
    const ret = api(args);
    if (ret && ret.errMsg) {
      ret.errMsg = ret.errMsg.replace(name, alias);
    }
    return ret
  }

  function getLastWebview () {
    try {
      const pages = getCurrentPages();
      if (pages.length) {
        return pages[pages.length - 1].$getAppWebview()
      }
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('getCurrentPages is not ready');
      }
    }
  }

  const getRealRoute = (e, t) => {
    if (t.indexOf('./') === 0) return getRealRoute(e, t.substr(2))
    let n;
    let i;
    let o = t.split('/');
    for (n = 0, i = o.length; n < i && o[n] === '..'; n++);
    o.splice(0, n);
    t = o.join('/');
    let r = e.length > 0 ? e.split('/') : [];
    r.splice(r.length - n - 1, n + 1);
    return r.concat(o).join('/')
  };

  // 处理 Android 平台解压与非解压模式下获取的路径不一致的情况
  const _handleLocalPath = filePath => {
    let localUrl = plus.io.convertLocalFileSystemURL(filePath);
    return localUrl.replace(/^\/?apps\//, '/android_asset/apps/').replace(/\/$/, '')
  };

  function getRealPath (filePath) {
    const SCHEME_RE = /^([a-z-]+:)?\/\//i;
    const DATA_RE = /^data:.*,.*/;

    // 无协议的情况补全 https
    if (filePath.indexOf('//') === 0) {
      filePath = 'https:' + filePath;
    }

    // 网络资源或base64
    if (SCHEME_RE.test(filePath) || DATA_RE.test(filePath)) {
      return filePath
    }

    if (filePath.indexOf('_www') === 0 || filePath.indexOf('_doc') === 0 || filePath.indexOf('_documents') === 0 ||
      filePath.indexOf('_downloads') === 0) {
      return 'file://' + _handleLocalPath(filePath)
    }
    const wwwPath = 'file://' + _handleLocalPath('_www');
    // 绝对路径转换为本地文件系统路径
    if (filePath.indexOf('/') === 0) {
      return wwwPath + filePath
    }
    // 相对资源
    if (filePath.indexOf('../') === 0 || filePath.indexOf('./') === 0) {
      if (typeof __id__ === 'string') {
        return wwwPath + getRealRoute('/' + __id__, filePath)
      } else {
        const pages = getCurrentPages();
        if (pages.length) {
          return wwwPath + getRealRoute('/' + pages[pages.length - 1].route, filePath)
        }
      }
    }
    return filePath
  }

  function getStatusBarStyle () {
    let style = plus.navigator.getStatusBarStyle();
    if (style === 'UIStatusBarStyleBlackTranslucent' || style === 'UIStatusBarStyleBlackOpaque' || style === 'null') {
      style = 'light';
    } else if (style === 'UIStatusBarStyleDefault') {
      style = 'dark';
    }
    return style
  }

  const PI = 3.1415926535897932384626;
  const a = 6378245.0;
  const ee = 0.00669342162296594323;

  function wgs84togcj02 (lng, lat) {
    lat = +lat;
    lng = +lng;
    if (outOfChina(lng, lat)) {
      return [lng, lat]
    }
    let dlat = _transformlat(lng - 105.0, lat - 35.0);
    let dlng = _transformlng(lng - 105.0, lat - 35.0);
    const radlat = lat / 180.0 * PI;
    let magic = Math.sin(radlat);
    magic = 1 - ee * magic * magic;
    const sqrtmagic = Math.sqrt(magic);
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
    dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
    const mglat = lat + dlat;
    const mglng = lng + dlng;
    return [mglng, mglat]
  }

  function gcj02towgs84 (lng, lat) {
    lat = +lat;
    lng = +lng;
    if (outOfChina(lng, lat)) {
      return [lng, lat]
    }
    let dlat = _transformlat(lng - 105.0, lat - 35.0);
    let dlng = _transformlng(lng - 105.0, lat - 35.0);
    const radlat = lat / 180.0 * PI;
    let magic = Math.sin(radlat);
    magic = 1 - ee * magic * magic;
    const sqrtmagic = Math.sqrt(magic);
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
    dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
    const mglat = lat + dlat;
    const mglng = lng + dlng;
    return [lng * 2 - mglng, lat * 2 - mglat]
  }

  const _transformlat = function (lng, lat) {
    let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
    return ret
  };
  const _transformlng = function (lng, lat) {
    let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
    return ret
  };

  const outOfChina = function (lng, lat) {
    return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false)
  };

  let webview;

  function setPullDownRefreshPageId (pullDownRefreshWebview) {
    if (typeof pullDownRefreshWebview === 'number') {
      webview = plus.webview.getWebviewById(String(pullDownRefreshWebview));
    } else {
      webview = pullDownRefreshWebview;
    }
  }

  function startPullDownRefresh () {
    if (webview) {
      webview.endPullToRefresh();
    }
    webview = getLastWebview();
    if (webview) {
      webview.beginPullToRefresh();
      return {
        errMsg: 'startPullDownRefresh:ok'
      }
    }
    return {
      errMsg: 'startPullDownRefresh:fail'
    }
  }

  function stopPullDownRefresh () {
    if (!webview) {
      webview = getLastWebview();
    }
    if (webview) {
      webview.endPullToRefresh();
      webview = null;
      return {
        errMsg: 'stopPullDownRefresh:ok'
      }
    }
    return {
      errMsg: 'stopPullDownRefresh:fail'
    }
  }

  function initOn (on, {
    getApp,
    getCurrentPages
  }) {
    function onError (err) {
      callAppHook(getApp(), 'onError', err);
    }

    function onPageNotFound (page) {
      callAppHook(getApp(), 'onPageNotFound', page);
    }

    function onPullDownRefresh (args, pageId) {
      const page = getCurrentPages().find(page => page.$page.id === pageId);
      if (page) {
        setPullDownRefreshPageId(pageId);
        callPageHook(page, 'onPullDownRefresh');
      }
    }

    function callCurrentPageHook (hook, args) {
      const pages = getCurrentPages();
      if (pages.length) {
        callPageHook(pages[pages.length - 1], hook, args);
      }
    }

    function createCallCurrentPageHook (hook) {
      return function (args) {
        callCurrentPageHook(hook, args);
      }
    }

    function onAppEnterBackground () {
      callAppHook(getApp(), 'onHide');
      callCurrentPageHook('onHide');
    }

    function onAppEnterForeground () {
      callAppHook(getApp(), 'onShow');
      callCurrentPageHook('onShow');
    }

    function onWebInvokeAppService ({
      name,
      arg
    }, pageId) {
      if (name === 'postMessage') ; else {
        uni[name](arg);
      }
    }

    const routeHooks = {
      navigateTo () {
        callCurrentPageHook('onHide');
      },
      navigateBack () {
        callCurrentPageHook('onShow');
      }
    };

    function onAppRoute ({
      type
    }) {
      const routeHook = routeHooks[type];
      routeHook && routeHook();
    }

    on('onError', onError);
    on('onPageNotFound', onPageNotFound);

    { // 后续有时间，h5 平台也要迁移到 onAppRoute
      on('onAppRoute', onAppRoute);
    }

    on('onAppEnterBackground', onAppEnterBackground);
    on('onAppEnterForeground', onAppEnterForeground);

    on('onPullDownRefresh', onPullDownRefresh);

    on('onTabItemTap', createCallCurrentPageHook('onTabItemTap'));
    on('onNavigationBarButtonTap', createCallCurrentPageHook('onNavigationBarButtonTap'));

    on('onNavigationBarSearchInputChanged', createCallCurrentPageHook('onNavigationBarSearchInputChanged'));
    on('onNavigationBarSearchInputConfirmed', createCallCurrentPageHook('onNavigationBarSearchInputConfirmed'));
    on('onNavigationBarSearchInputClicked', createCallCurrentPageHook('onNavigationBarSearchInputClicked'));

    on('onWebInvokeAppService', onWebInvokeAppService);
  }

  let supportsPassive = false;
  try {
    const opts = {};
    Object.defineProperty(opts, 'passive', ({
      get () {
        /* istanbul ignore next */
        supportsPassive = true;
      }
    })); // https://github.com/facebook/flow/issues/285
    window.addEventListener('test-passive', null, opts);
  } catch (e) {}

  const _toString = Object.prototype.toString;
  const hasOwnProperty = Object.prototype.hasOwnProperty;

  function isFn (fn) {
    return typeof fn === 'function'
  }

  function isPlainObject (obj) {
    return _toString.call(obj) === '[object Object]'
  }

  function hasOwn (obj, key) {
    return hasOwnProperty.call(obj, key)
  }

  function toRawType (val) {
    return _toString.call(val).slice(8, -1)
  }

  function getLen (str = '') {
    /* eslint-disable no-control-regex */
    return ('' + str).replace(/[^\x00-\xff]/g, '**').length
  }

  const decode = decodeURIComponent;

  function parseQuery (query) {
    const res = {};

    query = query.trim().replace(/^(\?|#|&)/, '');

    if (!query) {
      return res
    }

    query.split('&').forEach(param => {
      const parts = param.replace(/\+/g, ' ').split('=');
      const key = decode(parts.shift());
      const val = parts.length > 0
        ? decode(parts.join('='))
        : null;

      if (res[key] === undefined) {
        res[key] = val;
      } else if (Array.isArray(res[key])) {
        res[key].push(val);
      } else {
        res[key] = [res[key], val];
      }
    });

    return res
  }

  function parseTitleNView (routeOptions) {
    const windowOptions = routeOptions.window;
    const titleNView = windowOptions.titleNView;
    if ( // 无头
      titleNView === false ||
      titleNView === 'false' ||
      (
        windowOptions.navigationStyle === 'custom' &&
        !isPlainObject(titleNView)
      )
    ) {
      return false
    }

    const ret = {
      autoBackButton: !routeOptions.meta.isQuit,
      backgroundColor: windowOptions.navigationBarBackgroundColor || '#000000',
      titleText: windowOptions.navigationBarTitleText || '',
      titleColor: windowOptions.navigationBarTextStyle === 'black' ? '#000000' : '#ffffff'
    };

    routeOptions.meta.statusBarStyle = windowOptions.navigationBarTextStyle === 'black' ? 'dark' : 'light';

    if (isPlainObject(titleNView)) {
      return Object.assign(ret, titleNView)
    }

    return ret
  }

  function parsePullToRefresh (routeOptions) {
    const windowOptions = routeOptions.window;

    if (windowOptions.enablePullDownRefresh) {
      const pullToRefreshStyles = Object.create(null);
      // 初始化默认值
      if (plus.os.name === 'Android') {
        Object.assign(pullToRefreshStyles, {
          support: true,
          style: 'circle'
        });
      } else {
        Object.assign(pullToRefreshStyles, {
          support: true,
          style: 'default',
          height: '50px',
          range: '200px',
          contentdown: {
            caption: ''
          },
          contentover: {
            caption: ''
          },
          contentrefresh: {
            caption: ''
          }
        });
      }

      if (windowOptions.backgroundTextStyle) {
        pullToRefreshStyles.color = windowOptions.backgroundTextStyle;
        pullToRefreshStyles.snowColor = windowOptions.backgroundTextStyle;
      }

      Object.assign(pullToRefreshStyles, windowOptions.pullToRefresh || {});

      return pullToRefreshStyles
    }
  }

  const ANI_SHOW = 'pop-in';
  const ANI_DURATION = 300;

  const TABBAR_HEIGHT = 56;
  const TITLEBAR_HEIGHT = 44;

  const WEBVIEW_STYLE_BLACKLIST = [
    'navigationBarBackgroundColor',
    'navigationBarTextStyle',
    'navigationBarTitleText',
    'navigationBarShadow',
    'navigationStyle',
    'disableScroll',
    'backgroundColor',
    'backgroundTextStyle',
    'enablePullDownRefresh',
    'onReachBottomDistance',
    'usingComponents',
    // 需要解析的
    'titleNView',
    'pullToRefresh'
  ];

  function parseWebviewStyle (id, path, routeOptions = {}) {
    const webviewStyle = Object.create(null);

    // 合并
    routeOptions.window = Object.assign(
      JSON.parse(JSON.stringify(__uniConfig.window || {})),
      routeOptions.window || {}
    );

    Object.keys(routeOptions.window).forEach(name => {
      if (WEBVIEW_STYLE_BLACKLIST.indexOf(name) === -1) {
        webviewStyle[name] = routeOptions.window[name];
      }
    });

    const titleNView = parseTitleNView(routeOptions);
    if (titleNView) {
      if (id === 1 && __uniConfig.realEntryPagePath === path) {
        titleNView.autoBackButton = true;
      }
      webviewStyle.titleNView = titleNView;
    }

    const pullToRefresh = parsePullToRefresh(routeOptions);
    if (pullToRefresh) {
      if (pullToRefresh.style === 'circle') {
        webviewStyle.bounce = 'none';
      }
      webviewStyle.pullToRefresh = pullToRefresh;
    }

    // 不支持 hide
    if (webviewStyle.popGesture === 'hide') {
      delete webviewStyle.popGesture;
    }

    // TODO 下拉刷新

    if (path && routeOptions.meta.isNVue) {
      webviewStyle.uniNView = {
        path,
        defaultFontSize: __uniConfig.defaultFontSize,
        viewport: __uniConfig.viewport
      };
    }

    if (routeOptions.meta.isTabBar) {
      webviewStyle.top = 0;
      webviewStyle.bottom = TABBAR_HEIGHT;
    }

    return webviewStyle
  }

  let id = 2;

  const WEBVIEW_LISTENERS = {
    'pullToRefresh': 'onPullDownRefresh',
    'titleNViewSearchInputChanged': 'onNavigationBarSearchInputChanged',
    'titleNViewSearchInputConfirmed': 'onNavigationBarSearchInputConfirmed',
    'titleNViewSearchInputClicked': 'onNavigationBarSearchInputClicked'
  };

  function createWebview (path, routeOptions) {
    const webviewId = id++;
    const webviewStyle = parseWebviewStyle(
      webviewId,
      path,
      routeOptions
    );
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[uni-app] createWebview`, webviewId, path, webviewStyle);
    }
    const webview = plus.webview.create('', String(webviewId), webviewStyle);

    return webview
  }

  function initWebview (webview, routeOptions) {
    if (isPlainObject(routeOptions)) {
      const webviewStyle = parseWebviewStyle(
        parseInt(webview.id),
        '',
        routeOptions
      );
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[uni-app] updateWebview`, webviewStyle);
      }

      webview.setStyle(webviewStyle);
    }

    const {
      on,
      emit
    } = UniServiceJSBridge;

    // TODO subNVues
    Object.keys(WEBVIEW_LISTENERS).forEach(name => {
      webview.addEventListener(name, (e) => {
        emit(WEBVIEW_LISTENERS[name], e, parseInt(webview.id));
      });
    });

    webview.addEventListener('resize', ({
      width,
      height
    }) => {
      const res = {
        size: {
          windowWidth: Math.ceil(width),
          windowHeight: Math.ceil(height)
        }
      };
      publish('onViewDidResize', res);
      emit('onResize', res, parseInt(webview.id));
    });

    // TODO 应该结束之前未完成的下拉刷新
    on(webview.id + '.startPullDownRefresh', () => {
      webview.beginPullToRefresh();
    });

    on(webview.id + '.stopPullDownRefresh', () => {
      webview.endPullToRefresh();
    });

    return webview
  }

  const pages = [];

  function getCurrentPages$1 (returnAll) {
    return returnAll ? pages.slice(0) : pages.filter(page => {
      return !page.$page.meta.isTabBar || page.$page.meta.visible
    })
  }

  /**
   * 首页需要主动registerPage，二级页面路由跳转时registerPage
   */
  function registerPage ({
    path,
    query,
    openType,
    webview
  }) {
    const routeOptions = JSON.parse(JSON.stringify(__uniRoutes.find(route => route.path === path)));

    if (openType === 'reLaunch' || pages.length === 0) {
      // pages.length===0 表示首页触发 redirectTo
      routeOptions.meta.isQuit = true;
    }

    if (!webview) {
      webview = createWebview(path, routeOptions);
    } else {
      webview = plus.webview.getWebviewById(webview.id);
    }

    if (routeOptions.meta.isTabBar) {
      routeOptions.meta.visible = true;
    }

    if (routeOptions.meta.isTabBar && webview.id !== '1') {
      const launchWebview = plus.webview.getLaunchWebview();
      launchWebview && launchWebview.append(webview);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[uni-app] registerPage`, path, webview.id);
    }

    initWebview(webview, webview.id === '1' && routeOptions);

    const route = path.slice(1);

    webview.__uniapp_route = route;

    pages.push({
      route,
      options: Object.assign({}, query || {}),
      $getAppWebview () {
        return webview
      },
      $page: {
        id: parseInt(webview.id),
        meta: routeOptions.meta,
        path,
        route,
        openType
      },
      $remove () {
        const index = pages.findIndex(page => page === this);
        if (index !== -1) {
          pages.splice(index, 1);
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[uni-app] removePage`, path, webview.id);
          }
        }
      }
    });

    return webview
  }

  const callbacks = {};
  const WEB_INVOKE_APPSERVICE = 'WEB_INVOKE_APPSERVICE';
  // 简单处理 view 层与 service 层的通知系统
  /**
   * 消费 view 层通知
   */
  function consumePlusMessage (type, args) {
    // 处理 web-view 组件发送的通知
    if (type === WEB_INVOKE_APPSERVICE) {
      publish(WEB_INVOKE_APPSERVICE, args.data, args.webviewIds);
      return true
    }
    const callback = callbacks[type];
    if (callback) {
      callback(args);
      if (!callback.keepAlive) {
        delete callbacks[type];
      }
      return true
    }
    return false
  }
  /**
   * 注册 view 层通知 service 层事件处理
   */
  function registerPlusMessage (type, callback, keepAlive = true) {
    if (callbacks[type]) {
      return console.warn(`${type} 已注册:` + (callbacks[type].toString()))
    }
    callback.keepAlive = !!keepAlive;
    callbacks[type] = callback;
  }

  var safeArea = {
    get bottom () {
      if (plus.os.name === 'iOS') {
        const safeArea = plus.navigator.getSafeAreaInsets();
        return safeArea ? safeArea.bottom : 0
      }
      return 0
    }
  };

  const IMAGE_TOP = 7;
  const IMAGE_WIDTH = 24;
  const IMAGE_HEIGHT = 24;
  const TEXT_TOP = 36;
  const TEXT_SIZE = 12;
  const TEXT_NOICON_SIZE = 17;
  const TEXT_HEIGHT = 12;
  const IMAGE_ID = 'TABITEM_IMAGE_';
  const TABBAR_VIEW_ID = 'TABBAR_VIEW_';

  let view;
  let config;
  let winWidth;
  let itemWidth;
  let itemLength;
  let itemImageLeft;
  let itemRects = [];
  const itemIcons = [];
  const itemLayouts = [];
  const itemDot = [];
  const itemBadge = [];
  let itemClickCallback;

  let selected = 0;
  /**
   * tabbar显示状态
   */
  let visible = true;

  const init = function () {
    const list = config.list;
    itemLength = config.list.length;

    calcItemLayout(); // 计算选项卡布局

    initBitmaps(list); // 初始化选项卡图标

    initView();
  };

  let initView = function () {
    const viewStyles = {
      height: TABBAR_HEIGHT
    };
    if (config.position === 'top') {
      viewStyles.top = 0;
    } else {
      viewStyles.bottom = 0;
      viewStyles.height += safeArea.bottom;
    }
    view = new plus.nativeObj.View(TABBAR_VIEW_ID, viewStyles, getDraws());

    view.interceptTouchEvent(true);

    view.addEventListener('click', (e) => {
      if (!__uniConfig.__ready__) { // 未 ready，不允许点击
        return
      }
      const x = e.clientX;
      const y = e.clientY;
      for (let i = 0; i < itemRects.length; i++) {
        if (isCross(x, y, itemRects[i])) {
          const draws = getSelectedDraws(i);
          const drawTab = !!draws.length;
          itemClickCallback && itemClickCallback(config.list[i], i, drawTab);
          if (drawTab) {
            setTimeout(() => view.draw(draws));
          }
          break
        }
      }
    });
    plus.globalEvent.addEventListener('orientationchange', () => {
      calcItemLayout(config.list);
      if (config.position !== 'top') {
        let height = TABBAR_HEIGHT + safeArea.bottom;
        view.setStyle({
          height: height
        });
        if (visible) {
          setWebviewPosition(height);
        }
      }
      view.draw(getDraws());
    });
    if (!visible) {
      view.hide();
    }
  };

  let isCross = function (x, y, rect) {
    if (x > rect.left && x < (rect.left + rect.width) && y > rect.top && y < (rect.top + rect.height)) {
      return true
    }
    return false
  };

  let initBitmaps = function (list) {
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (item.iconData) {
        const bitmap = new plus.nativeObj.Bitmap(IMAGE_ID + i);
        bitmap.loadBase64Data(item.iconData);
        const selectedBitmap = new plus.nativeObj.Bitmap(`${IMAGE_ID}SELECTED_${i}`);
        selectedBitmap.loadBase64Data(item.selectedIconData);
        itemIcons[i] = {
          icon: bitmap,
          selectedIcon: selectedBitmap
        };
      } else if (item.iconPath) {
        itemIcons[i] = {
          icon: item.iconPath,
          selectedIcon: item.selectedIconPath
        };
      } else {
        itemIcons[i] = {
          icon: false,
          selectedIcon: false
        };
      }
    }
  };

  let getDraws = function () {
    const backgroundColor = config.backgroundColor;
    const borderHeight = Math.max(0.5, 1 / plus.screen.scale); // 高分屏最少0.5
    const borderTop = config.position === 'top' ? (TABBAR_HEIGHT - borderHeight) : 0;
    const borderStyle = config.borderStyle === 'white' ? 'rgba(255,255,255,0.33)' : 'rgba(0,0,0,0.33)';

    const draws = [{
      id: `${TABBAR_VIEW_ID}BG`, // 背景色
      tag: 'rect',
      color: backgroundColor,
      position: {
        top: 0,
        left: 0,
        width: '100%',
        height: TABBAR_HEIGHT + safeArea.bottom
      }
    }, {
      id: `${TABBAR_VIEW_ID}BORDER`,
      tag: 'rect',
      color: borderStyle,
      position: {
        top: borderTop,
        left: 0,
        width: '100%',
        height: `${borderHeight}px`
      }
    }];

    for (let i = 0; i < itemLength; i++) {
      const item = config.list[i];
      if (i === selected) {
        drawTabItem(draws, i, item.text, config.selectedColor, itemIcons[i].selectedIcon);
      } else {
        drawTabItem(draws, i, item.text, config.color, itemIcons[i].icon);
      }
    }
    return draws
  };

  let getSelectedDraws = function (newSelected) {
    if (selected === newSelected) {
      return false
    }
    const draws = [];
    const lastSelected = selected;
    selected = newSelected;
    drawTabItem(draws, lastSelected);
    drawTabItem(draws, selected);
    return draws
  };
  /**
   * 获取文字宽度（全角为1）
   * @param {*} text
   */
  function getFontWidth (text) {
    // eslint-disable-next-line
    return text.length - (text.match(/[\u0000-\u00ff]/g) || []).length / 2
  }
  let calcItemLayout = function () {
    winWidth = plus.screen.resolutionWidth;
    itemWidth = winWidth / itemLength;
    itemImageLeft = (itemWidth - IMAGE_WIDTH) / 2;
    itemRects = [];
    let dotTop = 0;
    let dotLeft = 0;
    for (let i = 0; i < itemLength; i++) {
      itemRects.push({
        top: 0,
        left: i * itemWidth,
        width: itemWidth,
        height: TABBAR_HEIGHT
      });
    }

    for (let i = 0; i < itemLength; i++) {
      const item = config.list[i];
      let imgLeft = itemWidth * i + itemImageLeft;
      if ((item.iconData || item.iconPath) && item.text) { // 图文
        itemLayouts[i] = {
          text: {
            top: TEXT_TOP,
            left: `${i * itemWidth}px`,
            width: `${itemWidth}px`,
            height: TEXT_HEIGHT
          },
          img: {
            top: IMAGE_TOP,
            left: `${imgLeft}px`,
            width: IMAGE_WIDTH,
            height: IMAGE_HEIGHT
          }
        };
        dotTop = IMAGE_TOP;
        dotLeft = imgLeft + IMAGE_WIDTH;
      } else if (!(item.iconData || item.iconPath) && item.text) { // 仅文字
        let textLeft = i * itemWidth;
        itemLayouts[i] = {
          text: {
            top: 0,
            left: `${textLeft}px`,
            width: `${itemWidth}px`,
            height: TABBAR_HEIGHT
          }
        };
        dotTop = (44 - TEXT_NOICON_SIZE) / 2;
        dotLeft = textLeft + itemWidth * 0.5 + getFontWidth(item.text) * TEXT_NOICON_SIZE * 0.5;
      } else if ((item.iconData || item.iconPath) && !item.text) { // 仅图片
        const diff = 10;
        let imgTop = (TABBAR_HEIGHT - IMAGE_HEIGHT - diff) / 2;
        let imgLeft = itemWidth * i + itemImageLeft - diff / 2;
        itemLayouts[i] = {
          img: {
            top: `${imgTop}px`,
            left: `${imgLeft}px`,
            width: IMAGE_WIDTH + diff,
            height: IMAGE_HEIGHT + diff
          }
        };
        dotTop = imgTop;
        dotLeft = imgLeft + IMAGE_WIDTH + diff;
      }
      let height = itemBadge[i] ? 14 : 10;
      let badge = itemBadge[i] || '0';
      let font = getFontWidth(badge) - 0.5;
      font = font > 1 ? 1 : font;
      let width = height + font * 12;
      width = width < height ? height : width;
      let itemLayout = itemLayouts[i];
      if (itemLayout) {
        itemLayout.doc = {
          top: dotTop,
          left: `${dotLeft - width * 0.382}px`,
          width: `${width}px`,
          height: `${height}px`
        };
        itemLayout.badge = {
          top: dotTop,
          left: `${dotLeft - width * 0.382}px`,
          width: `${width}px`,
          height: `${height}px`
        };
      }
    }
  };

  let drawTabItem = function (draws, index) {
    const layout = itemLayouts[index];

    const item = config.list[index];

    let color = config.color;
    let icon = itemIcons[index].icon;
    let dot = itemDot[index];
    let badge = itemBadge[index] || '';

    if (index === selected) {
      color = config.selectedColor;
      icon = itemIcons[index].selectedIcon;
    }

    if (icon) {
      draws.push({
        id: `${TABBAR_VIEW_ID}ITEM_${index}_ICON`,
        tag: 'img',
        position: layout.img,
        src: icon
      });
    }
    if (item.text) {
      draws.push({
        id: `${TABBAR_VIEW_ID}ITEM_${index}_TEXT`,
        tag: 'font',
        position: layout.text,
        text: item.text,
        textStyles: {
          size: icon ? TEXT_SIZE : `${TEXT_NOICON_SIZE}px`,
          color
        }
      });
    }
    const hiddenPosition = {
      letf: 0,
      top: 0,
      width: 0,
      height: 0
    };
    // 绘制小红点（角标背景）
    draws.push({
      id: `${TABBAR_VIEW_ID}ITEM_${index}_DOT`,
      tag: 'rect',
      position: (dot || badge) ? layout.doc : hiddenPosition,
      rectStyles: {
        color: '#ff0000',
        radius: badge ? '7px' : '5px'
      }
    });
    // 绘制角标文本
    draws.push({
      id: `${TABBAR_VIEW_ID}ITEM_${index}_BADGE`,
      tag: 'font',
      position: badge ? layout.badge : hiddenPosition,
      text: badge || ' ',
      textStyles: {
        align: 'center',
        verticalAlign: 'middle',
        color: badge ? '#ffffff' : 'rgba(0,0,0,0)',
        overflow: 'ellipsis',
        size: '10px'
      }
    });
  };
  /**
   * {
      "color": "#7A7E83",
      "selectedColor": "#3cc51f",
      "borderStyle": "black",
      "backgroundColor": "#ffffff",
      "list": [{
        "pagePath": "page/component/index.html",
        "iconData": "",
        "selectedIconData": "",
        "text": "组件"
      }, {
        "pagePath": "page/API/index.html",
        "iconData": "",
        "selectedIconData": "",
        "text": "接口"
      }],
      "position":"bottom"//bottom|top
    }
   */

  /**
   * 设置角标
   * @param {string} type
   * @param {number} index
   * @param {string} text
   */
  function setTabBarBadge (type, index, text) {
    if (type === 'none') {
      itemDot[index] = false;
      itemBadge[index] = '';
    } else if (type === 'text') {
      itemBadge[index] = text;
    } else if (type === 'redDot') {
      itemDot[index] = true;
    }
    if (view) {
      calcItemLayout(config.list);
      view.draw(getDraws());
    }
  }
  /**
   * 动态设置 tabBar 某一项的内容
   */
  function setTabBarItem (index, text, iconPath, selectedIconPath) {
    if (iconPath || selectedIconPath) {
      let itemIcon = itemIcons[index] = itemIcons[index] || {};
      if (iconPath) {
        itemIcon.icon = getRealPath(iconPath);
      }
      if (selectedIconPath) {
        itemIcon.selectedIcon = getRealPath(selectedIconPath);
      }
    }
    if (text) {
      config.list[index].text = text;
    }
    view.draw(getDraws());
  }
  /**
   * 动态设置 tabBar 的整体样式
   * @param {Object} style 样式
   */
  function setTabBarStyle (style) {
    for (const key in style) {
      config[key] = style[key];
    }
    view.draw(getDraws());
  }
  /**
   * 设置tab页底部或顶部距离
   * @param {*} value 距离
   */
  function setWebviewPosition (value) {
    const position = config.position === 'top' ? 'top' : 'bottom';
    plus.webview.all().forEach(webview => {
      if (isTabBarPage(String(webview.__uniapp_route))) {
        webview.setStyle({
          [position]: value
        });
      }
    });
  }
  /**
   * 隐藏 tabBar
   * @param {boolean} animation 是否需要动画效果 暂未支持
   */
  function hideTabBar (animation) {
    if (visible === false) {
      return
    }
    visible = false;
    if (view) {
      view.hide();
      setWebviewPosition(0);
    }
  }
  /**
   * 显示 tabBar
   * @param {boolean} animation 是否需要动画效果 暂未支持
   */
  function showTabBar (animation) {
    if (visible === true) {
      return
    }
    visible = true;
    if (view) {
      view.show();
      setWebviewPosition(TABBAR_HEIGHT + safeArea.bottom);
    }
  }

  var tabBar = {
    init (options, clickCallback) {
      if (options && options.list.length) {
        selected = options.selected || 0;
        config = options;
        config.position = 'bottom'; // 暂时强制使用bottom
        itemClickCallback = clickCallback;
        init();
        return view
      }
    },
    switchTab (page) {
      if (itemLength) {
        for (let i = 0; i < itemLength; i++) {
          if (
            config.list[i].pagePath === page ||
            config.list[i].pagePath === `${page}.html`
          ) {
            const draws = getSelectedDraws(i);
            if (draws.length) {
              view.draw(draws);
            }
            return true
          }
        }
      }
      return false
    },
    setTabBarBadge,
    setTabBarItem,
    setTabBarStyle,
    hideTabBar,
    showTabBar,
    get visible () {
      return visible
    }
  };

  let appCtx;

  const NETWORK_TYPES = [
    'unknown',
    'none',
    'ethernet',
    'wifi',
    '2g',
    '3g',
    '4g'
  ];

  function getApp () {
    return appCtx
  }

  function initGlobalListeners () {
    const emit = UniServiceJSBridge.emit;

    plus.key.addEventListener('backbutton', () => {
      uni.navigateBack({
        from: 'backbutton'
      });
    });

    plus.globalEvent.addEventListener('pause', () => {
      emit('onAppEnterBackground');
    });

    plus.globalEvent.addEventListener('resume', () => {
      emit('onAppEnterForeground');
    });

    plus.globalEvent.addEventListener('netchange', () => {
      const networkType = NETWORK_TYPES[plus.networkinfo.getCurrentType()];
      publish('onNetworkStatusChange', {
        isConnected: networkType !== 'none',
        networkType
      });
    });

    plus.globalEvent.addEventListener('KeyboardHeightChange', function (event) {
      publish('onKeyboardHeightChange', {
        height: event.height
      });
    });

    plus.globalEvent.addEventListener('plusMessage', function (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('UNIAPP[plusMessage]:[' + Date.now() + ']' + JSON.stringify(e.data));
      }
      if (e.data && e.data.type) {
        const type = e.data.type;
        consumePlusMessage(type, e.data.args || {});
      }
    });
  }

  function initAppLaunch (appVm) {
    const args = {
      path: __uniConfig.entryPagePath,
      query: {},
      scene: 1001
    };

    callAppHook(appVm, 'onLaunch', args);
    callAppHook(appVm, 'onShow', args);
  }

  function initTabBar () {
    if (!__uniConfig.tabBar || !__uniConfig.tabBar.list.length) {
      return
    }

    __uniConfig.tabBar.selected = 0;

    const selected = __uniConfig.tabBar.list.findIndex(page => page.pagePath === __uniConfig.entryPagePath);
    if (selected !== -1) {
      // 取当前 tab 索引值
      __uniConfig.tabBar.selected = selected;
      // 如果真实的首页与 condition 都是 tabbar，无需启用 realEntryPagePath 机制
      if (__uniConfig.realEntryPagePath && isTabBarPage(__uniConfig.realEntryPagePath)) {
        delete __uniConfig.realEntryPagePath;
      }
    }

    __uniConfig.__ready__ = true;

    const onLaunchWebviewReady = function onLaunchWebviewReady () {
      const tabBarView = tabBar.init(__uniConfig.tabBar, (item, index) => {
        UniServiceJSBridge.emit('onTabItemTap', {
          index,
          text: item.text,
          pagePath: item.pagePath
        });
        uni.switchTab({
          url: '/' + item.pagePath,
          openType: 'switchTab',
          from: 'tabbar'
        });
      });
      tabBarView && plus.webview.getLaunchWebview().append(tabBarView);
    };
    if (plus.webview.getLaunchWebview()) {
      onLaunchWebviewReady();
    } else {
      registerPlusMessage('UniWebviewReady-' + plus.runtime.appid, onLaunchWebviewReady, false);
    }
  }

  function registerApp (appVm) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[uni-app] registerApp`);
    }

    appCtx = appVm;

    appCtx.globalData = appVm.$options.globalData || {};

    initOn(UniServiceJSBridge.on, {
      getApp,
      getCurrentPages: getCurrentPages$1
    });

    initAppLaunch(appVm);

    initGlobalListeners();

    initTabBar();
  }

  function parseRoutes (config) {
    __uniRoutes.length = 0;
    /* eslint-disable no-mixed-operators */
    const tabBarList = (config.tabBar && config.tabBar.list || []).map(item => item.pagePath);

    Object.keys(config.page).forEach(function (pagePath) {
      const isTabBar = tabBarList.indexOf(pagePath) !== -1;
      const isQuit = isTabBar || (config.pages[0] === pagePath);
      const isNVue = !!config.page[pagePath].nvue;
      __uniRoutes.push({
        path: '/' + pagePath,
        meta: {
          isQuit,
          isTabBar,
          isNVue
        },
        window: config.page[pagePath].window || {}
      });
    });
  }

  function registerConfig (config, Vue) {
    Object.assign(__uniConfig, config);

    __uniConfig.viewport = '';
    __uniConfig.defaultFontSize = '';

    if (__uniConfig.nvueCompiler === 'uni-app') {
      __uniConfig.viewport = plus.screen.resolutionWidth;
      __uniConfig.defaultFontSize = __uniConfig.viewport / 20;
    }

    parseRoutes(__uniConfig);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[uni-app] registerConfig`, __uniConfig);
    }
  }

  const base = [
    'base64ToArrayBuffer',
    'arrayBufferToBase64',
    'addInterceptor',
    'removeInterceptor'
  ];

  const network = [
    'request',
    'uploadFile',
    'downloadFile',
    'connectSocket',
    'onSocketOpen',
    'onSocketError',
    'sendSocketMessage',
    'onSocketMessage',
    'closeSocket',
    'onSocketClose'
  ];

  const route = [
    'navigateTo',
    'redirectTo',
    'reLaunch',
    'switchTab',
    'navigateBack'
  ];

  const storage = [
    'setStorage',
    'setStorageSync',
    'getStorage',
    'getStorageSync',
    'getStorageInfo',
    'getStorageInfoSync',
    'removeStorage',
    'removeStorageSync',
    'clearStorage',
    'clearStorageSync'
  ];

  const location = [
    'getLocation',
    'chooseLocation',
    'openLocation',
    'createMapContext'
  ];

  const media = [
    'chooseImage',
    'previewImage',
    'getImageInfo',
    'saveImageToPhotosAlbum',
    'compressImage',
    'getRecorderManager',
    'getBackgroundAudioManager',
    'createInnerAudioContext',
    'chooseVideo',
    'saveVideoToPhotosAlbum',
    'createVideoContext',
    'createCameraContext',
    'createLivePlayerContext'
  ];

  const device = [
    'getSystemInfo',
    'getSystemInfoSync',
    'canIUse',
    'onMemoryWarning',
    'getNetworkType',
    'onNetworkStatusChange',
    'onAccelerometerChange',
    'startAccelerometer',
    'stopAccelerometer',
    'onCompassChange',
    'startCompass',
    'stopCompass',
    'onGyroscopeChange',
    'startGyroscope',
    'stopGyroscope',
    'makePhoneCall',
    'scanCode',
    'setClipboardData',
    'getClipboardData',
    'setScreenBrightness',
    'getScreenBrightness',
    'setKeepScreenOn',
    'onUserCaptureScreen',
    'vibrateLong',
    'vibrateShort',
    'addPhoneContact',
    'openBluetoothAdapter',
    'startBluetoothDevicesDiscovery',
    'onBluetoothDeviceFound',
    'stopBluetoothDevicesDiscovery',
    'onBluetoothAdapterStateChange',
    'getConnectedBluetoothDevices',
    'getBluetoothDevices',
    'getBluetoothAdapterState',
    'closeBluetoothAdapter',
    'writeBLECharacteristicValue',
    'readBLECharacteristicValue',
    'onBLEConnectionStateChange',
    'onBLECharacteristicValueChange',
    'notifyBLECharacteristicValueChange',
    'getBLEDeviceServices',
    'getBLEDeviceCharacteristics',
    'createBLEConnection',
    'closeBLEConnection',
    'onBeaconServiceChange',
    'onBeaconUpdate',
    'getBeacons',
    'startBeaconDiscovery',
    'stopBeaconDiscovery'
  ];

  const keyboard = [
    'hideKeyboard',
    'onKeyboardHeightChange'
  ];

  const ui = [
    'showToast',
    'hideToast',
    'showLoading',
    'hideLoading',
    'showModal',
    'showActionSheet',
    'setNavigationBarTitle',
    'setNavigationBarColor',
    'showNavigationBarLoading',
    'hideNavigationBarLoading',
    'setTabBarItem',
    'setTabBarStyle',
    'hideTabBar',
    'showTabBar',
    'setTabBarBadge',
    'removeTabBarBadge',
    'showTabBarRedDot',
    'hideTabBarRedDot',
    'setBackgroundColor',
    'setBackgroundTextStyle',
    'createAnimation',
    'pageScrollTo',
    'onWindowResize',
    'offWindowResize',
    'loadFontFace',
    'startPullDownRefresh',
    'stopPullDownRefresh',
    'createSelectorQuery',
    'createIntersectionObserver'
  ];

  const event = [
    '$emit',
    '$on',
    '$once',
    '$off'
  ];

  const file = [
    'saveFile',
    'getSavedFileList',
    'getSavedFileInfo',
    'removeSavedFile',
    'getFileInfo',
    'openDocument',
    'getFileSystemManager'
  ];

  const canvas = [
    'createOffscreenCanvas',
    'createCanvasContext',
    'canvasToTempFilePath',
    'canvasPutImageData',
    'canvasGetImageData'
  ];

  const third = [
    'getProvider',
    'login',
    'checkSession',
    'getUserInfo',
    'share',
    'showShareMenu',
    'hideShareMenu',
    'requestPayment',
    'subscribePush',
    'unsubscribePush',
    'onPush',
    'offPush',
    'requireNativePlugin',
    'upx2px'
  ];

  const apis = [
    ...base,
    ...network,
    ...route,
    ...storage,
    ...location,
    ...media,
    ...device,
    ...keyboard,
    ...ui,
    ...event,
    ...file,
    ...canvas,
    ...third
  ];

  var apis_1 = apis;

  /**
   * 框架内 try-catch
   */
  function tryCatchFramework (fn) {
    return function () {
      try {
        return fn.apply(fn, arguments)
      } catch (e) {
        // TODO
        console.error(e);
      }
    }
  }
  /**
   * 开发者 try-catch
   */
  function tryCatch (fn) {
    return function () {
      try {
        return fn.apply(fn, arguments)
      } catch (e) {
        // TODO
        console.error(e);
      }
    }
  }

  const HOOKS = [
    'invoke',
    'success',
    'fail',
    'complete',
    'returnValue'
  ];

  const globalInterceptors = {};
  const scopedInterceptors = {};

  function mergeHook (parentVal, childVal) {
    const res = childVal
      ? parentVal
        ? parentVal.concat(childVal)
        : Array.isArray(childVal)
          ? childVal : [childVal]
      : parentVal;
    return res
      ? dedupeHooks(res)
      : res
  }

  function dedupeHooks (hooks) {
    const res = [];
    for (let i = 0; i < hooks.length; i++) {
      if (res.indexOf(hooks[i]) === -1) {
        res.push(hooks[i]);
      }
    }
    return res
  }

  function removeHook (hooks, hook) {
    const index = hooks.indexOf(hook);
    if (index !== -1) {
      hooks.splice(index, 1);
    }
  }

  function mergeInterceptorHook (interceptor, option) {
    Object.keys(option).forEach(hook => {
      if (HOOKS.indexOf(hook) !== -1 && isFn(option[hook])) {
        interceptor[hook] = mergeHook(interceptor[hook], option[hook]);
      }
    });
  }

  function removeInterceptorHook (interceptor, option) {
    if (!interceptor || !option) {
      return
    }
    Object.keys(option).forEach(hook => {
      if (HOOKS.indexOf(hook) !== -1 && isFn(option[hook])) {
        removeHook(interceptor[hook], option[hook]);
      }
    });
  }

  function addInterceptor (method, option) {
    if (typeof method === 'string' && isPlainObject(option)) {
      mergeInterceptorHook(scopedInterceptors[method] || (scopedInterceptors[method] = {}), option);
    } else if (isPlainObject(method)) {
      mergeInterceptorHook(globalInterceptors, method);
    }
  }

  function removeInterceptor (method, option) {
    if (typeof method === 'string') {
      if (isPlainObject(option)) {
        removeInterceptorHook(scopedInterceptors[method], option);
      } else {
        delete scopedInterceptors[method];
      }
    } else if (isPlainObject(method)) {
      removeInterceptorHook(globalInterceptors, method);
    }
  }

  function wrapperHook (hook) {
    return function (data) {
      return hook(data) || data
    }
  }

  function isPromise (obj) {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'
  }

  function queue (hooks, data) {
    let promise = false;
    for (let i = 0; i < hooks.length; i++) {
      const hook = hooks[i];
      if (promise) {
        promise = Promise.then(wrapperHook(hook));
      } else {
        const res = hook(data);
        if (isPromise(res)) {
          promise = Promise.resolve(res);
        }
        if (res === false) {
          return {
            then () {}
          }
        }
      }
    }
    return promise || {
      then (callback) {
        return callback(data)
      }
    }
  }

  function wrapperOptions (interceptor, options = {}) {
    ['success', 'fail', 'complete'].forEach(name => {
      if (Array.isArray(interceptor[name])) {
        const oldCallback = options[name];
        options[name] = function callbackInterceptor (res) {
          queue(interceptor[name], res).then((res) => {
            /* eslint-disable no-mixed-operators */
            return isFn(oldCallback) && oldCallback(res) || res
          });
        };
      }
    });
    return options
  }

  function wrapperReturnValue (method, returnValue) {
    const returnValueHooks = [];
    if (Array.isArray(globalInterceptors.returnValue)) {
      returnValueHooks.push(...globalInterceptors.returnValue);
    }
    const interceptor = scopedInterceptors[method];
    if (interceptor && Array.isArray(interceptor.returnValue)) {
      returnValueHooks.push(...interceptor.returnValue);
    }
    returnValueHooks.forEach(hook => {
      returnValue = hook(returnValue) || returnValue;
    });
    return returnValue
  }

  function getApiInterceptorHooks (method) {
    const interceptor = Object.create(null);
    Object.keys(globalInterceptors).forEach(hook => {
      if (hook !== 'returnValue') {
        interceptor[hook] = globalInterceptors[hook].slice();
      }
    });
    const scopedInterceptor = scopedInterceptors[method];
    if (scopedInterceptor) {
      Object.keys(scopedInterceptor).forEach(hook => {
        if (hook !== 'returnValue') {
          interceptor[hook] = (interceptor[hook] || []).concat(scopedInterceptor[hook]);
        }
      });
    }
    return interceptor
  }

  function invokeApi (method, api, options, ...params) {
    const interceptor = getApiInterceptorHooks(method);
    if (interceptor && Object.keys(interceptor).length) {
      if (Array.isArray(interceptor.invoke)) {
        const res = queue(interceptor.invoke, options);
        return res.then((options) => {
          return api(wrapperOptions(interceptor, options), ...params)
        })
      } else {
        return api(wrapperOptions(interceptor, options), ...params)
      }
    }
    return api(options, ...params)
  }

  const promiseInterceptor = {
    returnValue (res) {
      if (!isPromise(res)) {
        return res
      }
      return res.then(res => {
        return res[1]
      }).catch(res => {
        return res[0]
      })
    }
  };

  const SYNC_API_RE =
    /^\$|getMenuButtonBoundingClientRect|^report|interceptors|Interceptor$|getSubNVueById|requireNativePlugin|upx2px|hideKeyboard|canIUse|^create|Sync$|Manager$|base64ToArrayBuffer|arrayBufferToBase64/;

  const CONTEXT_API_RE = /^create|Manager$/;

  const TASK_APIS = ['request', 'downloadFile', 'uploadFile', 'connectSocket'];

  const CALLBACK_API_RE = /^on/;

  function isContextApi (name) {
    return CONTEXT_API_RE.test(name)
  }
  function isSyncApi (name) {
    return SYNC_API_RE.test(name)
  }

  function isCallbackApi (name) {
    return CALLBACK_API_RE.test(name)
  }

  function isTaskApi (name) {
    return TASK_APIS.indexOf(name) !== -1
  }

  function handlePromise (promise) {
    return promise.then(data => {
      return [null, data]
    })
      .catch(err => [err])
  }

  function shouldPromise (name) {
    if (
      isContextApi(name) ||
      isSyncApi(name) ||
      isCallbackApi(name)
    ) {
      return false
    }
    return true
  }

  function promisify (name, api) {
    if (!shouldPromise(name)) {
      return api
    }
    return function promiseApi (options = {}, ...params) {
      if (isFn(options.success) || isFn(options.fail) || isFn(options.complete)) {
        return wrapperReturnValue(name, invokeApi(name, api, options, ...params))
      }
      return wrapperReturnValue(name, handlePromise(new Promise((resolve, reject) => {
        invokeApi(name, api, Object.assign({}, options, {
          success: resolve,
          fail: reject
        }), ...params);
        /* eslint-disable no-extend-native */
        if (!Promise.prototype.finally) {
          Promise.prototype.finally = function (callback) {
            const promise = this.constructor;
            return this.then(
              value => promise.resolve(callback()).then(() => value),
              reason => promise.resolve(callback()).then(() => {
                throw reason
              })
            )
          };
        }
      })))
    }
  }

  const base64ToArrayBuffer$1 = [{
    name: 'base64',
    type: String,
    required: true
  }];

  const arrayBufferToBase64$1 = [{
    name: 'arrayBuffer',
    type: [ArrayBuffer, Uint8Array],
    required: true
  }];

  var require_context_module_0_0 = /*#__PURE__*/Object.freeze({
    base64ToArrayBuffer: base64ToArrayBuffer$1,
    arrayBufferToBase64: arrayBufferToBase64$1
  });

  const canIUse = [{
    name: 'schema',
    type: String,
    required: true
  }];

  var require_context_module_0_1 = /*#__PURE__*/Object.freeze({
    canIUse: canIUse
  });

  const $on = [{
    name: 'event',
    type: [String, Array],
    required: true
  }, {
    name: 'callback',
    type: Function,
    required: true
  }];

  const $once = $on;

  const $off = [{
    name: 'event',
    type: [String, Array]
  }, {
    name: 'callback',
    type: Function
  }];

  const $emit = [{
    name: 'event',
    type: String,
    required: true
  }];

  var require_context_module_0_2 = /*#__PURE__*/Object.freeze({
    $on: $on,
    $once: $once,
    $off: $off,
    $emit: $emit
  });

  const addInterceptor$1 = [{
    name: 'method',
    type: [String, Object],
    required: true
  }];
  const removeInterceptor$1 = addInterceptor$1;

  var require_context_module_0_3 = /*#__PURE__*/Object.freeze({
    addInterceptor: addInterceptor$1,
    removeInterceptor: removeInterceptor$1
  });

  const upx2px = [{
    name: 'upx',
    type: [Number, String],
    required: true
  }];

  var require_context_module_0_4 = /*#__PURE__*/Object.freeze({
    upx2px: upx2px
  });

  function getInt (method) {
    return function (value, params) {
      if (value) {
        params[method] = Math.round(value);
      }
    }
  }

  const canvasGetImageData = {
    canvasId: {
      type: String,
      required: true
    },
    x: {
      type: Number,
      required: true,
      validator: getInt('x')
    },
    y: {
      type: Number,
      required: true,
      validator: getInt('y')
    },
    width: {
      type: Number,
      required: true,
      validator: getInt('width')
    },
    height: {
      type: Number,
      required: true,
      validator: getInt('height')
    }
  };

  const canvasPutImageData = {
    canvasId: {
      type: String,
      required: true
    },
    data: {
      type: Uint8ClampedArray,
      required: true
    },
    x: {
      type: Number,
      required: true,
      validator: getInt('x')
    },
    y: {
      type: Number,
      required: true,
      validator: getInt('y')
    },
    width: {
      type: Number,
      required: true,
      validator: getInt('width')
    },
    height: {
      type: Number,
      validator: getInt('height')
    }
  };

  const fileType = {
    PNG: 'png',
    JPG: 'jpeg'
  };

  const canvasToTempFilePath = {
    x: {
      type: Number,
      default: 0,
      validator: getInt('x')
    },
    y: {
      type: Number,
      default: 0,
      validator: getInt('y')
    },
    width: {
      type: Number,
      validator: getInt('width')
    },
    height: {
      type: Number,
      validator: getInt('height')
    },
    destWidth: {
      type: Number,
      validator: getInt('destWidth')
    },
    destHeight: {
      type: Number,
      validator: getInt('destHeight')
    },
    canvasId: {
      type: String,
      require: true
    },
    fileType: {
      type: String,
      validator (value, params) {
        value = (value || '').toUpperCase();
        params.fileType = value in fileType ? fileType[value] : fileType.PNG;
      }
    },
    quality: {
      type: Number,
      validator (value, params) {
        value = Math.floor(value);
        params.quality = value > 0 && value < 1 ? value : 1;
      }
    }
  };

  const drawCanvas = {
    canvasId: {
      type: String,
      require: true
    },
    actions: {
      type: Array,
      require: true
    },
    reserve: {
      type: Boolean,
      default: false
    }
  };

  var require_context_module_0_5 = /*#__PURE__*/Object.freeze({
    canvasGetImageData: canvasGetImageData,
    canvasPutImageData: canvasPutImageData,
    canvasToTempFilePath: canvasToTempFilePath,
    drawCanvas: drawCanvas
  });

  const validator = [{
    name: 'id',
    type: String,
    required: true
  }];

  const createAudioContext = validator;
  const createVideoContext = validator;
  const createMapContext = validator;
  const createCanvasContext = [{
    name: 'canvasId',
    type: String,
    required: true
  }, {
    name: 'componentInstance',
    type: Object
  }];

  var require_context_module_0_6 = /*#__PURE__*/Object.freeze({
    createAudioContext: createAudioContext,
    createVideoContext: createVideoContext,
    createMapContext: createMapContext,
    createCanvasContext: createCanvasContext
  });

  const makePhoneCall = {
    'phoneNumber': {
      type: String,
      required: true,
      validator (phoneNumber) {
        if (!phoneNumber) {
          return `makePhoneCall:fail parameter error: parameter.phoneNumber should not be empty String;`
        }
      }
    }
  };

  var require_context_module_0_7 = /*#__PURE__*/Object.freeze({
    makePhoneCall: makePhoneCall
  });

  const openDocument = {
    filePath: {
      type: String,
      required: true
    },
    fileType: {
      type: String
    }
  };

  var require_context_module_0_8 = /*#__PURE__*/Object.freeze({
    openDocument: openDocument
  });

  const chooseLocation = {
    keyword: {
      type: String
    }
  };

  var require_context_module_0_9 = /*#__PURE__*/Object.freeze({
    chooseLocation: chooseLocation
  });

  const type = {
    WGS84: 'WGS84',
    GCJ02: 'GCJ02'
  };
  const getLocation = {
    type: {
      type: String,
      validator (value, params) {
        value = (value || '').toUpperCase();
        params.type = Object.values(type).indexOf(value) < 0 ? type.WGS84 : value;
      },
      default: type.WGS84
    },
    altitude: {
      altitude: Boolean,
      default: false
    }
  };

  var require_context_module_0_10 = /*#__PURE__*/Object.freeze({
    getLocation: getLocation
  });

  const openLocation = {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    scale: {
      type: Number,
      validator (value, params) {
        value = Math.floor(value);
        params.scale = value >= 5 && value <= 18 ? value : 18;
      },
      default: 18
    },
    name: {
      type: String
    },
    address: {
      type: String
    }
  };

  var require_context_module_0_11 = /*#__PURE__*/Object.freeze({
    openLocation: openLocation
  });

  const SIZE_TYPES = ['original', 'compressed'];
  const SOURCE_TYPES = ['album', 'camera'];

  const chooseImage = {
    'count': {
      type: Number,
      required: false,
      default: 9,
      validator (count, params) {
        if (count <= 0) {
          params.count = 9;
        }
      }
    },
    'sizeType': {
      type: Array,
      required: false,
      default: SIZE_TYPES,
      validator (sizeType, params) {
        // 非必传的参数，不符合预期时处理为默认值。
        const length = sizeType.length;
        if (!length) {
          params.sizeType = SIZE_TYPES;
        } else {
          for (let i = 0; i < length; i++) {
            if (typeof sizeType[i] !== 'string' || !~SIZE_TYPES.indexOf(sizeType[i])) {
              params.sizeType = SIZE_TYPES;
              break
            }
          }
        }
      }
    },
    'sourceType': {
      type: Array,
      required: false,
      default: SOURCE_TYPES,
      validator (sourceType, params) {
        const length = sourceType.length;
        if (!length) {
          params.sourceType = SOURCE_TYPES;
        } else {
          for (let i = 0; i < length; i++) {
            if (typeof sourceType[i] !== 'string' || !~SOURCE_TYPES.indexOf(sourceType[i])) {
              params.sourceType = SOURCE_TYPES;
              break
            }
          }
        }
      }
    }
  };

  var require_context_module_0_12 = /*#__PURE__*/Object.freeze({
    chooseImage: chooseImage
  });

  const SOURCE_TYPES$1 = ['album', 'camera'];

  const chooseVideo = {
    'sourceType': {
      type: Array,
      required: false,
      default: SOURCE_TYPES$1,
      validator (sourceType, params) {
        const length = sourceType.length;
        if (!length) {
          params.sourceType = SOURCE_TYPES$1;
        } else {
          for (let i = 0; i < length; i++) {
            if (typeof sourceType[i] !== 'string' || !~SOURCE_TYPES$1.indexOf(sourceType[i])) {
              params.sourceType = SOURCE_TYPES$1;
              break
            }
          }
        }
      }
    }
  };

  var require_context_module_0_13 = /*#__PURE__*/Object.freeze({
    chooseVideo: chooseVideo
  });

  function getRealRoute$1 (fromRoute, toRoute) {
    if (!toRoute) {
      toRoute = fromRoute;
      if (toRoute.indexOf('/') === 0) {
        return toRoute
      }
      const pages = getCurrentPages();
      if (pages.length) {
        fromRoute = pages[pages.length - 1].$page.route;
      } else {
        fromRoute = '';
      }
    } else {
      if (toRoute.indexOf('/') === 0) {
        return toRoute
      }
    }
    if (toRoute.indexOf('./') === 0) {
      return getRealRoute$1(fromRoute, toRoute.substr(2))
    }
    const toRouteArray = toRoute.split('/');
    const toRouteLength = toRouteArray.length;
    let i = 0;
    for (; i < toRouteLength && toRouteArray[i] === '..'; i++) {
      // noop
    }
    toRouteArray.splice(0, i);
    toRoute = toRouteArray.join('/');
    const fromRouteArray = fromRoute.length > 0 ? fromRoute.split('/') : [];
    fromRouteArray.splice(fromRouteArray.length - i - 1, i + 1);
    return '/' + fromRouteArray.concat(toRouteArray).join('/')
  }

  const SCHEME_RE = /^([a-z-]+:)?\/\//i;
  const DATA_RE = /^data:.*,.*/;

  function addBase (filePath) {
    return filePath
  }

  function getRealPath$1 (filePath) {
    if (filePath.indexOf('/') === 0) {
      if (filePath.indexOf('//') === 0) {
        filePath = 'https:' + filePath;
      } else {
        return addBase(filePath.substr(1))
      }
    }
    // 网络资源或base64
    if (SCHEME_RE.test(filePath) || DATA_RE.test(filePath) || filePath.indexOf('blob:') === 0) {
      return filePath
    }

    const pages = getCurrentPages();
    if (pages.length) {
      return addBase(getRealRoute$1(pages[pages.length - 1].$page.route, filePath).substr(1))
    }

    return filePath
  }

  const getImageInfo = {
    'src': {
      type: String,
      required: true,
      validator (src, params) {
        params.src = getRealPath$1(src);
      }
    }
  };

  var require_context_module_0_14 = /*#__PURE__*/Object.freeze({
    getImageInfo: getImageInfo
  });

  const previewImage = {
    urls: {
      type: Array,
      required: true,
      validator (value, params) {
        var typeError;
        params.urls = value.map(url => {
          if (typeof url === 'string') {
            return getRealPath$1(url)
          } else {
            typeError = true;
          }
        });
        if (typeError) {
          return 'url is not string'
        }
      }
    },
    current: {
      type: [String, Number],
      validator (value, params) {
        if (typeof value === 'number') {
          params.current = value > 0 && value < params.urls.length ? value : 0;
        } else if (typeof value === 'string' && value) {
          params.current = getRealPath$1(value);
        }
      },
      default: 0
    }
  };

  var require_context_module_0_15 = /*#__PURE__*/Object.freeze({
    previewImage: previewImage
  });

  const downloadFile = {
    url: {
      type: String,
      required: true
    },
    header: {
      type: Object,
      validator (value, params) {
        params.header = value || {};
      }
    }
  };

  var require_context_module_0_16 = /*#__PURE__*/Object.freeze({
    downloadFile: downloadFile
  });

  const method = {
    OPTIONS: 'OPTIONS',
    GET: 'GET',
    HEAD: 'HEAD',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    TRACE: 'TRACE',
    CONNECT: 'CONNECT'
  };
  const dataType = {
    JSON: 'json'
  };
  const responseType = {
    TEXT: 'text',
    ARRAYBUFFER: 'arraybuffer'
  };

  const encode = encodeURIComponent;

  function stringifyQuery (url, data) {
    let str = url.split('#');
    const hash = str[1] || '';
    str = str[0].split('?');
    let query = str[1] || '';
    url = str[0];
    const search = query.split('&').filter(item => item);
    query = {};
    search.forEach(item => {
      item = item.split('=');
      query[item[0]] = item[1];
    });
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        if (isPlainObject(data[key])) {
          query[encode(key)] = encode(JSON.stringify(data[key]));
        } else {
          query[encode(key)] = encode(data[key]);
        }
      }
    }
    query = Object.keys(query).map(item => `${item}=${query[item]}`).join('&');
    return url + (query ? '?' + query : '') + (hash ? '#' + hash : '')
  }

  const request = {
    method: {
      type: String,
      validator (value, params) {
        value = (value || '').toUpperCase();
        params.method = Object.values(method).indexOf(value) < 0 ? method.GET : value;
      }
    },
    data: {
      type: [Object, String, ArrayBuffer],
      validator (value, params) {
        params.data = value || '';
      }
    },
    url: {
      type: String,
      required: true,
      validator (value, params) {
        if (
          params.method === method.GET &&
          isPlainObject(params.data) &&
          Object.keys(params.data).length
        ) { // 将 method,data 校验提前,保证 url 校验时,method,data 已被格式化
          params.url = stringifyQuery(value, params.data);
        }
      }
    },
    header: {
      type: Object,
      validator (value, params) {
        const header = params.header = value || {};
        if (params.method !== method.GET) {
          if (!Object.keys(header).find(key => key.toLowerCase() === 'content-type')) {
            header['Content-Type'] = 'application/json';
          }
        }
      }
    },
    dataType: {
      type: String,
      validator (value, params) {
        params.dataType = (value || dataType.JSON).toLowerCase();
      }
    },
    responseType: {
      type: String,
      validator (value, params) {
        value = (value || '').toLowerCase();
        params.responseType = Object.values(responseType).indexOf(value) < 0 ? responseType.TEXT : value;
      }
    }
  };

  var require_context_module_0_17 = /*#__PURE__*/Object.freeze({
    request: request
  });

  const method$1 = {
    OPTIONS: 'OPTIONS',
    GET: 'GET',
    HEAD: 'HEAD',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    TRACE: 'TRACE',
    CONNECT: 'CONNECT'
  };
  const connectSocket = {
    url: {
      type: String,
      required: true
    },
    header: {
      type: Object,
      validator (value, params) {
        params.header = value || {};
      }
    },
    method: {
      type: String,
      validator (value, params) {
        value = (value || '').toUpperCase();
        params.method = Object.values(method$1).indexOf(value) < 0 ? method$1.GET : value;
      }
    },
    protocols: {
      type: Array,
      validator (value, params) {
        params.protocols = (value || []).filter(str => typeof str === 'string');
      }
    }
  };
  const sendSocketMessage = {
    data: {
      type: [String, ArrayBuffer]
    }
  };
  const closeSocket = {
    code: {
      type: Number
    },
    reason: {
      type: String
    }
  };

  var require_context_module_0_18 = /*#__PURE__*/Object.freeze({
    connectSocket: connectSocket,
    sendSocketMessage: sendSocketMessage,
    closeSocket: closeSocket
  });

  const uploadFile = {
    url: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true,
      validator (value, params) {
        params.type = getRealPath$1(value);
      }
    },
    name: {
      type: String,
      required: true
    },
    header: {
      type: Object,
      validator (value, params) {
        params.header = value || {};
      }
    },
    formData: {
      type: Object,
      validator (value, params) {
        params.formData = value || {};
      }
    }
  };

  var require_context_module_0_19 = /*#__PURE__*/Object.freeze({
    uploadFile: uploadFile
  });

  const service = {
    OAUTH: 'OAUTH',
    SHARE: 'SHARE',
    PAYMENT: 'PAYMENT',
    PUSH: 'PUSH'
  };

  const getProvider = {
    service: {
      type: String,
      required: true,
      validator (value, params) {
        value = (value || '').toUpperCase();
        if (value && Object.values(service).indexOf(value) < 0) {
          return 'service error'
        }
      }
    }
  };

  var require_context_module_0_20 = /*#__PURE__*/Object.freeze({
    getProvider: getProvider
  });

  function encodeQueryString (url) {
    if (typeof url !== 'string') {
      return url
    }
    const index = url.indexOf('?');

    if (index === -1) {
      return url
    }

    const query = url.substr(index + 1).trim().replace(/^(\?|#|&)/, '');

    if (!query) {
      return url
    }

    url = url.substr(0, index);

    const params = [];

    query.split('&').forEach(param => {
      const parts = param.replace(/\+/g, ' ').split('=');
      const key = parts.shift();
      const val = parts.length > 0
        ? parts.join('=')
        : '';

      params.push(key + '=' + encodeURIComponent(val));
    });

    return params.length ? url + '?' + params.join('&') : url
  }

  function createValidator (type) {
    return function validator (url, params) {
      // 格式化为绝对路径路由
      url = getRealRoute$1(url);

      const pagePath = url.split('?')[0];
      // 匹配路由是否存在
      const routeOptions = __uniRoutes.find(({
        path,
        alias
      }) => path === pagePath || alias === pagePath);

      if (!routeOptions) {
        return 'page `' + url + '` is not found'
      }

      // 检测不同类型跳转
      if (type === 'navigateTo' || type === 'redirectTo') {
        if (routeOptions.meta.isTabBar) {
          return `can not ${type} a tabbar page`
        }
      } else if (type === 'switchTab') {
        if (!routeOptions.meta.isTabBar) {
          return 'can not switch to no-tabBar page'
        }
      }

      // tabBar不允许传递参数
      if (routeOptions.meta.isTabBar) {
        url = pagePath;
      }

      // 首页自动格式化为`/`
      if (routeOptions.meta.isEntry) {
        url = url.replace(routeOptions.alias, '/');
      }

      // 参数格式化
      params.url = encodeQueryString(url);
    }
  }

  function createProtocol (type, extras = {}) {
    return Object.assign({
      url: {
        type: String,
        required: true,
        validator: createValidator(type)
      }
    }, extras)
  }

  function createAnimationProtocol (animationTypes) {
    return {
      animationType: {
        type: String,
        validator (type) {
          if (type && animationTypes.indexOf(type) === -1) {
            return '`' + type + '` is not supported for `animationType` (supported values are: `' + animationTypes.join(
              '`|`') + '`)'
          }
        }
      },
      animationDuration: {
        type: Number
      }
    }
  }

  const redirectTo = createProtocol('redirectTo');

  const reLaunch = createProtocol('reLaunch');

  const navigateTo = createProtocol('navigateTo', createAnimationProtocol(
    [
      'slide-in-right',
      'slide-in-left',
      'slide-in-top',
      'slide-in-bottom',
      'fade-in',
      'zoom-out',
      'zoom-fade-out',
      'pop-in',
      'none'
    ]
  ));

  const switchTab = createProtocol('switchTab');

  const navigateBack = Object.assign({
    delta: {
      type: Number,
      validator (delta, params) {
        delta = parseInt(delta) || 1;
        params.delta = Math.min(getCurrentPages().length - 1, delta);
      }
    }
  }, createAnimationProtocol(
    [
      'slide-out-right',
      'slide-out-left',
      'slide-out-top',
      'slide-out-bottom',
      'fade-out',
      'zoom-in',
      'zoom-fade-in',
      'pop-out',
      'none'
    ]
  ));

  var require_context_module_0_21 = /*#__PURE__*/Object.freeze({
    redirectTo: redirectTo,
    reLaunch: reLaunch,
    navigateTo: navigateTo,
    switchTab: switchTab,
    navigateBack: navigateBack
  });

  const getStorage = {
    'key': {
      type: String,
      required: true
    }
  };

  const getStorageSync = [{
    name: 'key',
    type: String,
    required: true
  }];

  const setStorage = {
    'key': {
      type: String,
      required: true
    },
    'data': {
      required: true
    }
  };

  const setStorageSync = [{
    name: 'key',
    type: String,
    required: true
  }, {
    name: 'data',
    required: true
  }];

  const removeStorage = getStorage;
  const removeStorageSync = getStorageSync;

  var require_context_module_0_22 = /*#__PURE__*/Object.freeze({
    getStorage: getStorage,
    getStorageSync: getStorageSync,
    setStorage: setStorage,
    setStorageSync: setStorageSync,
    removeStorage: removeStorage,
    removeStorageSync: removeStorageSync
  });

  const FRONT_COLORS = ['#ffffff', '#000000'];
  const setNavigationBarColor = {
    'frontColor': {
      type: String,
      required: true,
      validator (frontColor, params) {
        if (FRONT_COLORS.indexOf(frontColor) === -1) {
          return `invalid frontColor "${frontColor}"`
        }
      }
    },
    'backgroundColor': {
      type: String,
      required: true
    },
    'animation': {
      type: Object,
      default () {
        return {
          duration: 0,
          timingFunc: 'linear'
        }
      },
      validator (animation = {}, params) {
        params.animation = {
          duration: animation.duration || 0,
          timingFunc: animation.timingFunc || 'linear'
        };
      }
    }
  };
  const setNavigationBarTitle = {
    'title': {
      type: String,
      required: true
    }
  };

  var require_context_module_0_23 = /*#__PURE__*/Object.freeze({
    setNavigationBarColor: setNavigationBarColor,
    setNavigationBarTitle: setNavigationBarTitle
  });

  const pageScrollTo = {
    scrollTop: {
      type: Number,
      required: true
    },
    duration: {
      type: Number,
      default: 300,
      validator (duration, params) {
        params.duration = Math.max(0, duration);
      }
    }
  };

  var require_context_module_0_24 = /*#__PURE__*/Object.freeze({
    pageScrollTo: pageScrollTo
  });

  const showModal = {
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    showCancel: {
      type: Boolean,
      default: true
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    cancelColor: {
      type: String,
      default: '#000000'
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    confirmColor: {
      type: String,
      default: '#007aff'
    },
    visible: {
      type: Boolean,
      default: true
    }
  };

  const showToast = {
    title: {
      type: String,
      default: ''
    },
    icon: {
      default: 'success',
      validator (icon, params) {
        if (['success', 'loading', 'none'].indexOf(icon) === -1) {
          params.icon = 'success';
        }
      }
    },
    image: {
      type: String,
      default: '',
      validator (image, params) {
        if (image) {
          params.image = getRealPath$1(image);
        }
      }
    },
    duration: {
      type: Number,
      default: 1500
    },
    mask: {
      type: Boolean,
      default: false
    },
    visible: {
      type: Boolean,
      default: true
    }
  };
  const showLoading = {
    title: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: 'loading'
    },
    duration: {
      type: Number,
      default: 100000000 // 简单处理 showLoading，直接设置个大值
    },
    mask: {
      type: Boolean,
      default: false
    },
    visible: {
      type: Boolean,
      default: true
    }
  };

  const showActionSheet = {
    itemList: {
      type: Array,
      required: true,
      validator (itemList, params) {
        if (!itemList.length) {
          return 'parameter.itemList should have at least 1 item'
        }
      }
    },
    itemColor: {
      type: String,
      default: '#000000'
    },
    visible: {
      type: Boolean,
      default: true
    }
  };

  var require_context_module_0_25 = /*#__PURE__*/Object.freeze({
    showModal: showModal,
    showToast: showToast,
    showLoading: showLoading,
    showActionSheet: showActionSheet
  });

  const indexValidator = {
    type: Number,
    required: true
  };

  const setTabBarItem$1 = {
    index: indexValidator,
    text: {
      type: String
    },
    iconPath: {
      type: String
    },
    selectedIconPath: {
      type: String
    }
  };

  const setTabBarStyle$1 = {
    color: {
      type: String
    },
    selectedColor: {
      type: String
    },
    backgroundColor: {
      type: String
    },
    borderStyle: {
      type: String,
      validator (borderStyle, params) {
        if (borderStyle) {
          params.borderStyle = borderStyle === 'black' ? 'black' : 'white';
        }
      }
    }
  };

  const hideTabBar$1 = {
    animation: {
      type: Boolean,
      default: false
    }
  };

  const showTabBar$1 = {
    animation: {
      type: Boolean,
      default: false
    }
  };

  const hideTabBarRedDot = {
    index: indexValidator
  };

  const showTabBarRedDot = {
    index: indexValidator
  };

  const removeTabBarBadge = {
    index: indexValidator
  };

  const setTabBarBadge$1 = {
    index: indexValidator,
    text: {
      type: String,
      required: true,
      validator (text, params) {
        if (getLen(text) >= 4) {
          params.text = '...';
        }
      }
    }
  };

  var require_context_module_0_26 = /*#__PURE__*/Object.freeze({
    setTabBarItem: setTabBarItem$1,
    setTabBarStyle: setTabBarStyle$1,
    hideTabBar: hideTabBar$1,
    showTabBar: showTabBar$1,
    hideTabBarRedDot: hideTabBarRedDot,
    showTabBarRedDot: showTabBarRedDot,
    removeTabBarBadge: removeTabBarBadge,
    setTabBarBadge: setTabBarBadge$1
  });

  const protocol = Object.create(null);
  const modules = 
    (function() {
      var map = {
        './base/base64.js': require_context_module_0_0,
  './base/can-i-use.js': require_context_module_0_1,
  './base/event-bus.js': require_context_module_0_2,
  './base/interceptor.js': require_context_module_0_3,
  './base/upx2px.js': require_context_module_0_4,
  './context/canvas.js': require_context_module_0_5,
  './context/context.js': require_context_module_0_6,
  './device/make-phone-call.js': require_context_module_0_7,
  './file/open-document.js': require_context_module_0_8,
  './location/choose-location.js': require_context_module_0_9,
  './location/get-location.js': require_context_module_0_10,
  './location/open-location.js': require_context_module_0_11,
  './media/choose-image.js': require_context_module_0_12,
  './media/choose-video.js': require_context_module_0_13,
  './media/get-image-info.js': require_context_module_0_14,
  './media/preview-image.js': require_context_module_0_15,
  './network/download-file.js': require_context_module_0_16,
  './network/request.js': require_context_module_0_17,
  './network/socket.js': require_context_module_0_18,
  './network/upload-file.js': require_context_module_0_19,
  './plugin/get-provider.js': require_context_module_0_20,
  './route/route.js': require_context_module_0_21,
  './storage/storage.js': require_context_module_0_22,
  './ui/navigation-bar.js': require_context_module_0_23,
  './ui/page-scroll-to.js': require_context_module_0_24,
  './ui/popup.js': require_context_module_0_25,
  './ui/tab-bar.js': require_context_module_0_26,

      };
      var req = function req(key) {
        return map[key] || (function() { throw new Error("Cannot find module '" + key + "'.") }());
      };
      req.keys = function() {
        return Object.keys(map);
      };
      return req;
    })();

  modules.keys().forEach(function (key) {
    Object.assign(protocol, modules(key));
  });

  function validateParam (key, paramTypes, paramsData) {
    const paramOptions = paramTypes[key];
    const absent = !hasOwn(paramsData, key);
    let value = paramsData[key];

    const booleanIndex = getTypeIndex(Boolean, paramOptions.type);
    if (booleanIndex > -1) {
      if (absent && !hasOwn(paramOptions, 'default')) {
        value = false;
      }
    }
    if (value === undefined) {
      if (hasOwn(paramOptions, 'default')) {
        const paramDefault = paramOptions['default'];
        value = isFn(paramDefault) ? paramDefault() : paramDefault;
        paramsData[key] = value; // 默认值
      }
    }

    return assertParam(paramOptions, key, value, absent, paramsData)
  }

  function assertParam (
    paramOptions,
    name,
    value,
    absent,
    paramsData
  ) {
    if (paramOptions.required && absent) {
      return `Missing required parameter \`${name}\``
    }

    if (value == null && !paramOptions.required) {
      const validator = paramOptions.validator;
      if (validator) {
        return validator(value, paramsData)
      }
      return
    }
    let type = paramOptions.type;
    let valid = !type || type === true;
    const expectedTypes = [];
    if (type) {
      if (!Array.isArray(type)) {
        type = [type];
      }
      for (let i = 0; i < type.length && !valid; i++) {
        const assertedType = assertType(value, type[i]);
        expectedTypes.push(assertedType.expectedType || '');
        valid = assertedType.valid;
      }
    }

    if (!valid) {
      return getInvalidTypeMessage(name, value, expectedTypes)
    }

    const validator = paramOptions.validator;
    if (validator) {
      return validator(value, paramsData)
    }
  }

  const simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;

  function assertType (value, type) {
    let valid;
    const expectedType = getType(type);
    if (simpleCheckRE.test(expectedType)) {
      const t = typeof value;
      valid = t === expectedType.toLowerCase();
      if (!valid && t === 'object') {
        valid = value instanceof type;
      }
    } else if (expectedType === 'Object') {
      valid = isPlainObject(value);
    } else if (expectedType === 'Array') {
      valid = Array.isArray(value);
    } else {
      valid = value instanceof type;
    }
    return {
      valid,
      expectedType
    }
  }

  function getType (fn) {
    const match = fn && fn.toString().match(/^\s*function (\w+)/);
    return match ? match[1] : ''
  }

  function isSameType (a, b) {
    return getType(a) === getType(b)
  }

  function getTypeIndex (type, expectedTypes) {
    if (!Array.isArray(expectedTypes)) {
      return isSameType(expectedTypes, type) ? 0 : -1
    }
    for (let i = 0, len = expectedTypes.length; i < len; i++) {
      if (isSameType(expectedTypes[i], type)) {
        return i
      }
    }
    return -1
  }

  function getInvalidTypeMessage (name, value, expectedTypes) {
    let message = `parameter \`${name}\`.` +
  		` Expected ${expectedTypes.join(', ')}`;
    const expectedType = expectedTypes[0];
    const receivedType = toRawType(value);
    const expectedValue = styleValue(value, expectedType);
    const receivedValue = styleValue(value, receivedType);
    if (expectedTypes.length === 1 &&
  		isExplicable(expectedType) &&
  		!isBoolean(expectedType, receivedType)) {
      message += ` with value ${expectedValue}`;
    }
    message += `, got ${receivedType} `;
    if (isExplicable(receivedType)) {
      message += `with value ${receivedValue}.`;
    }
    return message
  }

  function styleValue (value, type) {
    if (type === 'String') {
      return `"${value}"`
    } else if (type === 'Number') {
      return `${Number(value)}`
    } else {
      return `${value}`
    }
  }

  const explicitTypes = ['string', 'number', 'boolean'];

  function isExplicable (value) {
    return explicitTypes.some(elem => value.toLowerCase() === elem)
  }

  function isBoolean (...args) {
    return args.some(elem => elem.toLowerCase() === 'boolean')
  }

  function invokeCallbackHandlerFail (err, apiName, callbackId) {
    const errMsg = `${apiName}:fail ${err}`;
    console.error(errMsg);
    if (callbackId === -1) {
      throw new Error(errMsg)
    }
    if (typeof callbackId === 'number') {
      invokeCallbackHandler(callbackId, {
        errMsg
      });
    }
    return false
  }

  const callbackApiParamTypes = [{
    name: 'callback',
    type: Function,
    required: true
  }];

  function validateParams (apiName, paramsData, callbackId) {
    let paramTypes = protocol[apiName];
    if (!paramTypes && isCallbackApi(apiName)) {
      paramTypes = callbackApiParamTypes;
    }
    if (paramTypes) {
      if (Array.isArray(paramTypes) && Array.isArray(paramsData)) {
        const paramTypeObj = Object.create(null);
        const paramsDataObj = Object.create(null);
        const paramsDataLength = paramsData.length;
        paramTypes.forEach((paramType, index) => {
          paramTypeObj[paramType.name] = paramType;
          if (paramsDataLength > index) {
            paramsDataObj[paramType.name] = paramsData[index];
          }
        });
        paramTypes = paramTypeObj;
        paramsData = paramsDataObj;
      }

      if (isFn(paramTypes.beforeValidate)) {
        const err = paramTypes.beforeValidate(paramsData);
        if (err) {
          return invokeCallbackHandlerFail(err, apiName, callbackId)
        }
      }

      const keys = Object.keys(paramTypes);
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] === 'beforeValidate') {
          continue
        }
        const err = validateParam(keys[i], paramTypes, paramsData);
        if (err) {
          return invokeCallbackHandlerFail(err, apiName, callbackId)
        }
      }
    }
    return true
  }

  let invokeCallbackId = 1;

  const invokeCallbacks = {};

  function createKeepAliveApiCallback (apiName, callback) {
    const callbackId = invokeCallbackId++;
    const invokeCallbackName = 'api.' + apiName + '.' + callbackId;

    const invokeCallback = function (res) {
      callback(res);
    };

    invokeCallbacks[callbackId] = {
      name: invokeCallbackName,
      keepAlive: true,
      callback: invokeCallback
    };
    return callbackId
  }

  function createApiCallback (apiName, params = {}, extras = {}) {
    if (!isPlainObject(params)) {
      return {
        params
      }
    }
    params = Object.assign({}, params);

    const apiCallbacks = {};
    for (let name in params) {
      const param = params[name];
      if (isFn(param)) {
        apiCallbacks[name] = tryCatch(param);
        delete params[name];
      }
    }

    const {
      success,
      fail,
      cancel,
      complete
    } = apiCallbacks;

    const hasSuccess = isFn(success);
    const hasFail = isFn(fail);
    const hasCancel = isFn(cancel);
    const hasComplete = isFn(complete);

    if (!hasSuccess && !hasFail && !hasCancel && !hasComplete) { // 无回调
      return {
        params
      }
    }

    const wrapperCallbacks = {};
    for (let name in extras) {
      const extra = extras[name];
      if (isFn(extra)) {
        wrapperCallbacks[name] = tryCatchFramework(extra);
        delete extras[name];
      }
    }

    const {
      beforeSuccess,
      afterSuccess,
      beforeFail,
      afterFail,
      beforeCancel,
      afterCancel,
      afterAll
    } = wrapperCallbacks;

    const callbackId = invokeCallbackId++;
    const invokeCallbackName = 'api.' + apiName + '.' + callbackId;

    const invokeCallback = function (res) {
      res.errMsg = res.errMsg || apiName + ':ok';

      // 部分 api 可能返回的 errMsg 的 api 名称部分不一致，格式化为正确的
      if (res.errMsg.indexOf(':ok') !== -1) {
        res.errMsg = apiName + ':ok';
      } else if (res.errMsg.indexOf(':cancel') !== -1) {
        res.errMsg = apiName + ':cancel';
      } else if (res.errMsg.indexOf(':fail') !== -1) {
        res.errMsg = apiName + ':fail';
      }

      const errMsg = res.errMsg;

      if (errMsg.indexOf(apiName + ':ok') === 0) {
        isFn(beforeSuccess) && beforeSuccess(res);

        hasSuccess && success(res);

        isFn(afterSuccess) && afterSuccess(res);
      } else if (errMsg.indexOf(apiName + ':cancel') === 0) {
        res.errMsg = res.errMsg.replace(apiName + ':cancel', apiName + ':fail cancel');

        hasFail && fail(res);

        isFn(beforeCancel) && beforeCancel(res);

        hasCancel && cancel(res);

        isFn(afterCancel) && afterCancel(res);
      } else if (errMsg.indexOf(apiName + ':fail') === 0) {
        isFn(beforeFail) && beforeFail(res);

        hasFail && fail(res);

        isFn(afterFail) && afterFail(res);
      }

      hasComplete && complete(res);

      isFn(afterAll) && afterAll(res);
    };

    invokeCallbacks[callbackId] = {
      name: invokeCallbackName,
      callback: invokeCallback
    };

    return {
      params,
      callbackId
    }
  }

  function createInvokeCallback (apiName, params = {}, extras = {}) {
    const {
      params: args,
      callbackId
    } = createApiCallback(apiName, params, extras);

    if (isPlainObject(args) && !validateParams(apiName, args, callbackId)) {
      return {
        params: args,
        callbackId: false
      }
    }

    return {
      params: args,
      callbackId
    }
  }

  function invokeCallbackHandler (invokeCallbackId, res) {
    if (typeof invokeCallbackId === 'number') {
      const invokeCallback = invokeCallbacks[invokeCallbackId];
      if (invokeCallback) {
        if (!invokeCallback.keepAlive) {
          delete invokeCallbacks[invokeCallbackId];
        }
        return invokeCallback.callback(res)
      }
    }
    return res
  }

  function wrapperUnimplemented (name) {
    return function todo (args) {
      console.error('API `' + name + '` is not yet implemented');
    }
  }

  function wrapper (name, invokeMethod, extras) {
    if (!isFn(invokeMethod)) {
      return invokeMethod
    }
    return function (...args) {
      if (isSyncApi(name)) {
        if (validateParams(name, args, -1)) {
          return invokeMethod.apply(null, args)
        }
      } else if (isCallbackApi(name)) {
        if (validateParams(name, args, -1)) {
          return invokeMethod(createKeepAliveApiCallback(name, args[0]))
        }
      } else {
        let argsObj = {};
        if (args.length) {
          argsObj = args[0];
        }
        const {
          params,
          callbackId
        } = createInvokeCallback(name, argsObj, extras);
        if (callbackId !== false) {
          let res;
          if (isFn(params)) {
            res = invokeMethod(callbackId);
          } else {
            res = invokeMethod(params, callbackId);
          }
          if (res && !isTaskApi(name)) {
            res = invokeCallbackHandler(callbackId, res);
            if (isPlainObject(res)) {
              res.errMsg = res.errMsg || name + ':ok';
            }
          }
          return res
        }
      }
    }
  }

  function base64ToArrayBuffer$2 (str) {
    return base64Arraybuffer_2(str)
  }

  function arrayBufferToBase64$2 (buffer) {
    return base64Arraybuffer_1(buffer)
  }

  var require_context_module_1_0 = /*#__PURE__*/Object.freeze({
    base64ToArrayBuffer: base64ToArrayBuffer$2,
    arrayBufferToBase64: arrayBufferToBase64$2
  });

  var platformSchema = {};

  // TODO 待处理其他 API 的检测

  function canIUse$1 (schema) {
    if (hasOwn(platformSchema, schema)) {
      return platformSchema[schema]
    }
    return true
  }

  var require_context_module_1_1 = /*#__PURE__*/Object.freeze({
    canIUse: canIUse$1
  });

  const interceptors = {
    promiseInterceptor
  };

  var require_context_module_1_2 = /*#__PURE__*/Object.freeze({
    interceptors: interceptors,
    addInterceptor: addInterceptor,
    removeInterceptor: removeInterceptor
  });

  const EPS = 1e-4;
  const BASE_DEVICE_WIDTH = 750;
  let isIOS = false;
  let deviceWidth = 0;
  let deviceDPR = 0;

  function checkDeviceWidth () {
    const {
      platform,
      pixelRatio,
      windowWidth
    } = uni.getSystemInfoSync();

    deviceWidth = windowWidth;
    deviceDPR = pixelRatio;
    isIOS = platform === 'ios';
  }

  function upx2px$1 (number, newDeviceWidth) {
    if (deviceWidth === 0) {
      checkDeviceWidth();
    }

    number = Number(number);
    if (number === 0) {
      return 0
    }
    let result = (number / BASE_DEVICE_WIDTH) * (newDeviceWidth || deviceWidth);
    if (result < 0) {
      result = -result;
    }
    result = Math.floor(result + EPS);
    if (result === 0) {
      if (deviceDPR === 1 || !isIOS) {
        return 1
      } else {
        return 0.5
      }
    }
    return number < 0 ? -result : result
  }

  var require_context_module_1_3 = /*#__PURE__*/Object.freeze({
    upx2px: upx2px$1
  });

  let audios = {};

  const evts = ['play', 'canplay', 'ended', 'stop', 'waiting', 'seeking', 'seeked', 'pause'];

  const publishAudioStateChange = (state, res = {}) => publish('onAudioStateChange', Object.assign({
    state
  }, res));

  const initStateChage = audioId => {
    const audio = audios[audioId];
    if (!audio) {
      return
    }
    if (!audio.initStateChage) {
      audio.initStateChage = true;

      audio.addEventListener('error', error => {
        publishAudioStateChange('error', {
          audioId,
          errMsg: 'MediaError',
          errCode: error.code
        });
      });

      evts.forEach(event => {
        audio.addEventListener(event, () => {
          // 添加 isStopped 属性是为了解决 安卓设备停止播放后获取播放进度不正确的问题
          if (event === 'play') {
            audio.isStopped = false;
          } else if (event === 'stop') {
            audio.isStopped = true;
          }
          publishAudioStateChange(event, {
            audioId
          });
        });
      });
    }
  };

  function createAudioInstance () {
    const audioId = `${Date.now()}${Math.random()}`;
    const audio = audios[audioId] = plus.audio.createPlayer('');
    audio.src = '';
    audio.volume = 1;
    audio.startTime = 0;
    return {
      errMsg: 'createAudioInstance:ok',
      audioId
    }
  }

  function destroyAudioInstance ({
    audioId
  }) {
    if (audios[audioId]) {
      audios[audioId].close();
      delete audios[audioId];
    }
    return {
      errMsg: 'destroyAudioInstance:ok',
      audioId
    }
  }

  function setAudioState ({
    audioId,
    src,
    startTime,
    autoplay = false,
    loop = false,
    obeyMuteSwitch,
    volume
  }) {
    const audio = audios[audioId];
    if (audio) {
      let style = {
        loop,
        autoplay
      };
      if (src) {
        audio.src = style.src = getRealPath(src);
      }
      if (startTime) {
        audio.startTime = style.startTime = startTime;
      }
      if (typeof volume === 'number') {
        audio.volume = style.volume = volume;
      }
      audio.setStyles(style);
      initStateChage(audioId);
    }
    return {
      errMsg: 'setAudioState:ok'
    }
  }

  function getAudioState ({
    audioId
  }) {
    const audio = audios[audioId];
    if (!audio) {
      return {
        errMsg: 'getAudioState:fail'
      }
    }
    let {
      src,
      startTime,
      volume
    } = audio;

    return {
      errMsg: 'getAudioState:ok',
      duration: 1e3 * (audio.getDuration() || 0),
      currentTime: audio.isStopped ? 0 : 1e3 * audio.getPosition(),
      paused: audio.isPaused,
      src,
      volume,
      startTime: 1e3 * startTime,
      buffered: 1e3 * audio.getBuffered()
    }
  }

  function operateAudio ({
    operationType,
    audioId,
    currentTime
  }) {
    const audio = audios[audioId];
    const operationTypes = ['play', 'pause', 'stop'];
    if (operationTypes.indexOf(operationType) >= 0) {
      audio[operationType === operationTypes[0] && audio.isPaused ? 'resume' : operationType]();
    } else if (operationType === 'seek') {
      audio.seekTo(currentTime / 1e3);
    }
    return {
      errMsg: 'operateAudio:ok'
    }
  }

  let audio;

  const publishBackgroundAudioStateChange = (state, res = {}) => publish('onBackgroundAudioStateChange', Object.assign({
    state
  }, res));

  const events = ['play', 'pause', 'ended', 'stop'];

  function initMusic () {
    if (audio) {
      return
    }
    audio = plus.audio.createPlayer({
      autoplay: true,
      backgroundControl: true
    });
    audio.src = audio.title = audio.epname = audio.singer = audio.coverImgUrl = audio.webUrl = '';
    audio.startTime = 0;
    events.forEach(event => {
      audio.addEventListener(event, () => {
        // 添加 isStopped 属性是为了解决 安卓设备停止播放后获取播放进度不正确的问题
        if (event === 'play') {
          audio.isStopped = false;
        } else if (event === 'stop') {
          audio.isStopped = true;
        }
        const eventName = `onMusic${event[0].toUpperCase() + event.substr(1)}`;
        publish(eventName, {
          dataUrl: audio.src,
          errMsg: `${eventName}:ok`
        });
        publishBackgroundAudioStateChange(event, {
          dataUrl: audio.src
        });
      });
    });
    audio.addEventListener('waiting', () => {
      publishBackgroundAudioStateChange('waiting', {
        dataUrl: audio.src
      });
    });
    audio.addEventListener('error', err => {
      publish('onMusicError', {
        dataUrl: audio.src,
        errMsg: 'Error:' + err.message
      });
      publishBackgroundAudioStateChange('error', {
        dataUrl: audio.src,
        errMsg: err.message,
        errCode: err.code
      });
    });
    audio.addEventListener('prev', () => publish('onBackgroundAudioPrev'));
    audio.addEventListener('next', () => publish('onBackgroundAudioNext'));
  }

  function setMusicState (args) {
    initMusic();
    const props = ['src', 'startTime', 'coverImgUrl', 'webUrl', 'singer', 'epname', 'title'];
    const style = {};
    Object.keys(args).forEach(key => {
      if (props.indexOf(key) >= 0) {
        let val = args[key];
        if (key === props[0] && val) {
          val = getRealPath(val);
        }
        audio[key] = style[key] = val;
      }
    });
    audio.setStyles(style);
  }

  function getAudio () {
    return audio
  }

  function getMusicPlayerState () {
    const audio = getAudio();
    if (audio) {
      return {
        dataUrl: audio.src,
        duration: audio.getDuration() || 0,
        currentPosition: audio.getPosition(),
        status: audio.isPaused ? 0 : 1,
        downloadPercent: Math.round(100 * audio.getBuffered() / audio.getDuration()),
        errMsg: `getMusicPlayerState:ok`
      }
    }
    return {
      status: 2,
      errMsg: `getMusicPlayerState:ok`
    }
  }
  function operateMusicPlayer ({
    operationType,
    dataUrl,
    position,
    api = 'operateMusicPlayer',
    title,
    coverImgUrl
  }) {
    const audio = getAudio();
    var operationTypes = ['resume', 'pause', 'stop'];
    if (operationTypes.indexOf(operationType) > 0) {
      audio && audio[operationType]();
    } else if (operationType === 'play') {
      setMusicState({
        src: dataUrl,
        startTime: position,
        title,
        coverImgUrl
      });
      audio.play();
    } else if (operationType === 'seek') {
      audio && audio.seekTo(position);
    }
    return {
      errMsg: `${api}:ok`
    }
  }
  function setBackgroundAudioState (args) {
    setMusicState(args);
    return {
      errMsg: `setBackgroundAudioState:ok`
    }
  }
  function operateBackgroundAudio ({
    operationType,
    src,
    startTime,
    currentTime
  }) {
    return operateMusicPlayer({
      operationType,
      dataUrl: src,
      position: startTime || currentTime || 0,
      api: 'operateBackgroundAudio'
    })
  }
  function getBackgroundAudioState () {
    let data = {
      duration: 0,
      currentTime: 0,
      paused: false,
      src: '',
      buffered: 0,
      title: '',
      epname: '',
      singer: '',
      coverImgUrl: '',
      webUrl: '',
      startTime: 0,
      errMsg: `getBackgroundAudioState:ok`
    };
    const audio = getAudio();
    if (audio) {
      let newData = {
        duration: audio.getDuration() || 0,
        currentTime: audio.isStopped ? 0 : audio.getPosition(),
        paused: audio.isPaused,
        src: audio.src,
        buffered: audio.getBuffered(),
        title: audio.title,
        epname: audio.epname,
        singer: audio.singer,
        coverImgUrl: audio.coverImgUrl,
        webUrl: audio.webUrl,
        startTime: audio.startTime
      };
      data = Object.assign(data, newData);
    }
    return data
  }

  const DEVICE_FREQUENCY = 200;
  const NETWORK_TYPES$1 = ['unknown', 'none', 'ethernet', 'wifi', '2g', '3g', '4g'];

  const MAP_ID = '__UNIAPP_MAP';

  const TEMP_PATH_BASE = '_doc/uniapp_temp';
  const TEMP_PATH = `${TEMP_PATH_BASE}_${Date.now()}`;

  let watchAccelerationId = false;
  let isWatchAcceleration = false;

  const clearWatchAcceleration = () => {
    if (watchAccelerationId) {
      plus.accelerometer.clearWatch(watchAccelerationId);
      watchAccelerationId = false;
    }
  };

  function enableAccelerometer ({
    enable
  }) {
    if (enable) { // 启用监听
      clearWatchAcceleration();
      watchAccelerationId = plus.accelerometer.watchAcceleration((res) => {
        publish('onAccelerometerChange', {
          x: res.xAxis,
          y: res.yAxis,
          z: res.zAxis,
          errMsg: 'enableAccelerometer:ok'
        });
      }, (e) => {
        publish('onAccelerometerChange', {
          errMsg: 'enableAccelerometer:fail'
        });
      }, {
        frequency: DEVICE_FREQUENCY
      });
      if (!isWatchAcceleration) {
        isWatchAcceleration = true;
        const webview = getLastWebview();
        if (webview) {
          webview.addEventListener('close', clearWatchAcceleration);
        }
      }
    } else {
      clearWatchAcceleration();
    }
    return {
      errMsg: 'enableAccelerometer:ok'
    }
  }

  function addPhoneContact ({
    photoFilePath = '',
    nickName,
    lastName,
    middleName,
    firstName,
    remark,
    mobilePhoneNumber,
    weChatNumber,
    addressCountry,
    addressState,
    addressCity,
    addressStreet,
    addressPostalCode,
    organization,
    title,
    workFaxNumber,
    workPhoneNumber,
    hostNumber,
    email,
    url,
    workAddressCountry,
    workAddressState,
    workAddressCity,
    workAddressStreet,
    workAddressPostalCode,
    homeFaxNumber,
    homePhoneNumber,
    homeAddressCountry,
    homeAddressState,
    homeAddressCity,
    homeAddressStreet,
    homeAddressPostalCode
  } = {}, callbackId) {
    plus.contacts.getAddressBook(plus.contacts.ADDRESSBOOK_PHONE, (addressbook) => {
      const contact = addressbook.create();
      const name = {};
      if (lastName) {
        name.familyName = lastName;
      }
      if (firstName) {
        name.givenName = firstName;
      }
      if (middleName) {
        name.middleName = middleName;
      }
      contact.name = name;

      if (nickName) {
        contact.nickname = nickName;
      }

      if (photoFilePath) {
        contact.photos = [{
          type: 'url',
          value: photoFilePath
        }];
      }

      if (remark) {
        contact.note = remark;
      }

      const mobilePhone = {
        type: 'mobile'
      };

      const workPhone = {
        type: 'work'
      };

      const companyPhone = {
        type: 'company'
      };

      const homeFax = {
        type: 'home fax'
      };

      const workFax = {
        type: 'work fax'
      };

      if (mobilePhoneNumber) {
        mobilePhone.value = mobilePhoneNumber;
      }

      if (workPhoneNumber) {
        workPhone.value = workPhoneNumber;
      }

      if (hostNumber) {
        companyPhone.value = hostNumber;
      }

      if (homeFaxNumber) {
        homeFax.value = homeFaxNumber;
      }

      if (workFaxNumber) {
        workFax.value = workFaxNumber;
      }

      contact.phoneNumbers = [mobilePhone, workPhone, companyPhone, homeFax, workFax];

      if (email) {
        contact.emails = [{
          type: 'home',
          value: email
        }];
      }

      if (url) {
        contact.urls = [{
          type: 'other',
          value: url
        }];
      }

      if (weChatNumber) {
        contact.ims = [{
          type: 'other',
          value: weChatNumber
        }];
      }

      const defaultAddress = {
        type: 'other',
        preferred: true
      };

      const homeAddress = {
        type: 'home'
      };
      const companyAddress = {
        type: 'company'
      };

      if (addressCountry) {
        defaultAddress.country = addressCountry;
      }

      if (addressState) {
        defaultAddress.region = addressState;
      }

      if (addressCity) {
        defaultAddress.locality = addressCity;
      }

      if (addressStreet) {
        defaultAddress.streetAddress = addressStreet;
      }

      if (addressPostalCode) {
        defaultAddress.postalCode = addressPostalCode;
      }

      if (homeAddressCountry) {
        homeAddress.country = homeAddressCountry;
      }

      if (homeAddressState) {
        homeAddress.region = homeAddressState;
      }

      if (homeAddressCity) {
        homeAddress.locality = homeAddressCity;
      }

      if (homeAddressStreet) {
        homeAddress.streetAddress = homeAddressStreet;
      }

      if (homeAddressPostalCode) {
        homeAddress.postalCode = homeAddressPostalCode;
      }

      if (workAddressCountry) {
        companyAddress.country = workAddressCountry;
      }

      if (workAddressState) {
        companyAddress.region = workAddressState;
      }

      if (workAddressCity) {
        companyAddress.locality = workAddressCity;
      }

      if (workAddressStreet) {
        companyAddress.streetAddress = workAddressStreet;
      }

      if (workAddressPostalCode) {
        companyAddress.postalCode = workAddressPostalCode;
      }

      contact.addresses = [defaultAddress, homeAddress, companyAddress];

      contact.save(() => {
        invoke(callbackId, {
          errMsg: 'addPhoneContact:ok'
        });
      }, (e) => {
        invoke(callbackId, {
          errMsg: 'addPhoneContact:fail'
        });
      });
    }, (e) => {
      invoke(callbackId, {
        errMsg: 'addPhoneContact:fail'
      });
    });
  }

  /**
   * 执行蓝牙相关方法
   */
  function bluetoothExec (method, callbackId, data = {}, beforeSuccess) {
    var deviceId = data.deviceId;
    if (deviceId) {
      data.deviceId = deviceId.toUpperCase();
    }
    var serviceId = data.serviceId;
    if (serviceId) {
      data.serviceId = serviceId.toUpperCase();
    }

    plus.bluetooth[method.replace('Changed', 'Change')](Object.assign(data, {
      success (data) {
        if (typeof beforeSuccess === 'function') {
          beforeSuccess(data);
        }
        invoke(callbackId, Object.assign({}, data, {
          errMsg: `${method}:ok`,
          code: undefined,
          message: undefined
        }));
      },
      fail (error = {}) {
        invoke(callbackId, {
          errMsg: `${method}:fail ${error.message || ''}`,
          errCode: error.code || 0
        });
      }
    }));
  }
  /**
   * 监听蓝牙相关事件
   */
  function bluetoothOn (method, beforeSuccess) {
    plus.bluetooth[method.replace('Changed', 'Change')](function (data) {
      if (typeof beforeSuccess === 'function') {
        beforeSuccess(data);
      }
      publish(method, Object.assign({}, data, {
        code: undefined,
        message: undefined
      }));
    });
    return true
  }

  function checkDevices (data) {
    data.devices = data.devices.map(device => {
      var advertisData = device.advertisData;
      if (advertisData && typeof advertisData !== 'string') {
        device.advertisData = arrayBufferToBase64(advertisData);
      }
      return device
    });
  }

  var onBluetoothAdapterStateChange;
  var onBluetoothDeviceFound;
  var onBLEConnectionStateChange;
  var onBLEConnectionStateChanged;
  var onBLECharacteristicValueChange;

  function openBluetoothAdapter (data, callbackId) {
    onBluetoothAdapterStateChange = onBluetoothAdapterStateChange || bluetoothOn('onBluetoothAdapterStateChange');
    bluetoothExec('openBluetoothAdapter', callbackId);
  }

  function closeBluetoothAdapter (data, callbackId) {
    bluetoothExec('closeBluetoothAdapter', callbackId);
  }

  function getBluetoothAdapterState (data, callbackId) {
    bluetoothExec('getBluetoothAdapterState', callbackId);
  }

  function startBluetoothDevicesDiscovery (data, callbackId) {
    onBluetoothDeviceFound = onBluetoothDeviceFound || bluetoothOn('onBluetoothDeviceFound', checkDevices);
    bluetoothExec('startBluetoothDevicesDiscovery', callbackId, data);
  }

  function stopBluetoothDevicesDiscovery (data, callbackId) {
    bluetoothExec('stopBluetoothDevicesDiscovery', callbackId);
  }

  function getBluetoothDevices (data, callbackId) {
    bluetoothExec('getBluetoothDevices', callbackId, {}, checkDevices);
  }

  function getConnectedBluetoothDevices (data, callbackId) {
    bluetoothExec('getConnectedBluetoothDevices', callbackId, data);
  }

  function createBLEConnection (data, callbackId) {
    onBLEConnectionStateChange = onBLEConnectionStateChange || bluetoothOn('onBLEConnectionStateChange');
    onBLEConnectionStateChanged = onBLEConnectionStateChanged || bluetoothOn('onBLEConnectionStateChanged');
    bluetoothExec('createBLEConnection', callbackId, data);
  }

  function closeBLEConnection (data, callbackId) {
    bluetoothExec('closeBLEConnection', callbackId, data);
  }

  function getBLEDeviceServices (data, callbackId) {
    bluetoothExec('getBLEDeviceServices', callbackId, data);
  }

  function getBLEDeviceCharacteristics (data, callbackId) {
    bluetoothExec('getBLEDeviceCharacteristics', callbackId, data);
  }

  function notifyBLECharacteristicValueChange (data, callbackId) {
    onBLECharacteristicValueChange = onBLECharacteristicValueChange || bluetoothOn('onBLECharacteristicValueChange',
      data => {
        data.value = arrayBufferToBase64(data.value);
      });
    bluetoothExec('notifyBLECharacteristicValueChange', callbackId, data);
  }

  function notifyBLECharacteristicValueChanged (data, callbackId) {
    onBLECharacteristicValueChange = onBLECharacteristicValueChange || bluetoothOn('onBLECharacteristicValueChange',
      data => {
        data.value = arrayBufferToBase64(data.value);
      });
    bluetoothExec('notifyBLECharacteristicValueChanged', callbackId, data);
  }

  function readBLECharacteristicValue (data, callbackId) {
    bluetoothExec('readBLECharacteristicValue', callbackId, data);
  }

  function writeBLECharacteristicValue (data, callbackId) {
    data.value = base64ToArrayBuffer(data.value);
    bluetoothExec('writeBLECharacteristicValue', callbackId, data);
  }

  function getScreenBrightness () {
    return {
      errMsg: 'getScreenBrightness:ok',
      value: plus.screen.getBrightness()
    }
  }

  function setScreenBrightness ({
    value
  } = {}) {
    plus.screen.setBrightness(value);
    return {
      errMsg: 'setScreenBrightness:ok'
    }
  }

  function setKeepScreenOn ({
    keepScreenOn
  } = {}) {
    plus.device.setWakelock(!!keepScreenOn);
    return {
      errMsg: 'setKeepScreenOn:ok'
    }
  }

  function getClipboardData (options, callbackId) {
    const clipboard = requireNativePlugin('clipboard');
    clipboard.getString(ret => {
      if (ret.result === 'success') {
        invoke(callbackId, {
          data: ret.data,
          errMsg: 'getClipboardData:ok'
        });
      } else {
        invoke(callbackId, {
          data: ret.result,
          errMsg: 'getClipboardData:fail'
        });
      }
    });
  }

  function setClipboardData ({
    data
  }) {
    const clipboard = requireNativePlugin('clipboard');
    clipboard.setString(data);
    return {
      errMsg: 'setClipboardData:ok'
    }
  }

  let watchOrientationId = false;
  let isWatchOrientation = false;

  const clearWatchOrientation = () => {
    if (watchOrientationId) {
      plus.orientation.clearWatch(watchOrientationId);
      watchOrientationId = false;
    }
  };

  function enableCompass ({
    enable
  }) {
    if (enable) {
      clearWatchOrientation();
      watchOrientationId = plus.orientation.watchOrientation((o) => {
        publish('onCompassChange', {
          direction: o.magneticHeading,
          errMsg: 'enableCompass:ok'
        });
      }, (e) => {
        publish('onCompassChange', {
          errMsg: 'enableCompass:fail'
        });
      }, {
        frequency: DEVICE_FREQUENCY
      });
      if (!isWatchOrientation) {
        isWatchOrientation = true;
        const webview = getLastWebview();
        if (webview) {
          webview.addEventListener('close', () => {
            plus.orientation.clearWatch(watchOrientationId);
          });
        }
      }
    } else {
      clearWatchOrientation();
    }
    return {
      errMsg: 'enableCompass:ok'
    }
  }

  function getNetworkType () {
    return {
      errMsg: 'getNetworkType:ok',
      networkType: NETWORK_TYPES$1[plus.networkinfo.getCurrentType()]
    }
  }

  let beaconUpdateState = false;

  function onBeaconUpdate () {
    if (!beaconUpdateState) {
      plus.ibeacon.onBeaconUpdate(function (data) {
        publish('onBeaconUpdated', data);
      });
      beaconUpdateState = true;
    }
  }

  let beaconServiceChangeState = false;

  function onBeaconServiceChange () {
    if (!beaconServiceChangeState) {
      plus.ibeacon.onBeaconServiceChange(function (data) {
        publish('onBeaconServiceChange', data);
        publish('onBeaconServiceChanged', data);
      });
      beaconServiceChangeState = true;
    }
  }

  function getBeacons (params, callbackId) {
    plus.ibeacon.getBeacons({
      success: (result) => {
        invoke(callbackId, {
          errMsg: 'getBeacons:ok',
          beacons: result.beacons
        });
      },
      fail: (error) => {
        invoke(callbackId, {
          errMsg: 'getBeacons:fail:' + error.message
        });
      }
    });
  }

  function startBeaconDiscovery ({
    uuids,
    ignoreBluetoothAvailable = false
  }, callbackId) {
    plus.ibeacon.startBeaconDiscovery({
      uuids,
      ignoreBluetoothAvailable,
      success: (result) => {
        invoke(callbackId, {
          errMsg: 'startBeaconDiscovery:ok',
          beacons: result.beacons
        });
      },
      fail: (error) => {
        invoke(callbackId, {
          errMsg: 'startBeaconDiscovery:fail:' + error.message
        });
      }
    });
  }

  function stopBeaconDiscovery (params, callbackId) {
    plus.ibeacon.stopBeaconDiscovery({
      success: (result) => {
        invoke(callbackId, Object.assign(result, {
          errMsg: 'stopBeaconDiscovery:ok'
        }));
      },
      fail: (error) => {
        invoke(callbackId, {
          errMsg: 'stopBeaconDiscovery:fail:' + error.message
        });
      }
    });
  }

  function makePhoneCall$1 ({
    phoneNumber
  } = {}) {
    plus.device.dial(phoneNumber);
    return {
      errMsg: 'makePhoneCall:ok'
    }
  }

  const SCAN_ID = '__UNIAPP_SCAN';
  const SCAN_PATH = '_www/__uniappscan.html';

  const MESSAGE_TYPE = 'scanCode';

  function scanCode ({
    onlyFromCamera = false,
    scanType
  }, callbackId) {
    const barcode = plus.barcode;
    const SCAN_TYPES = {
      'qrCode': [
        barcode.QR,
        barcode.AZTEC,
        barcode.MAXICODE
      ],
      'barCode': [
        barcode.EAN13,
        barcode.EAN8,
        barcode.UPCA,
        barcode.UPCE,
        barcode.CODABAR,
        barcode.CODE128,
        barcode.CODE39,
        barcode.CODE93,
        barcode.ITF,
        barcode.RSS14,
        barcode.RSSEXPANDED
      ],
      'datamatrix': [barcode.DATAMATRIX],
      'pdf417': [barcode.PDF417]
    };

    const SCAN_MAPS = {
      [barcode.QR]: 'QR_CODE',
      [barcode.EAN13]: 'EAN_13',
      [barcode.EAN8]: 'EAN_8',
      [barcode.DATAMATRIX]: 'DATA_MATRIX',
      [barcode.UPCA]: 'UPC_A',
      [barcode.UPCE]: 'UPC_E',
      [barcode.CODABAR]: 'CODABAR',
      [barcode.CODE39]: 'CODE_39',
      [barcode.CODE93]: 'CODE_93',
      [barcode.CODE128]: 'CODE_128',
      [barcode.ITF]: 'CODE_25',
      [barcode.PDF417]: 'PDF_417',
      [barcode.AZTEC]: 'AZTEC',
      [barcode.RSS14]: 'RSS_14',
      [barcode.RSSEXPANDED]: 'RSSEXPANDED'
    };

    const statusBarStyle = getStatusBarStyle();
    const isDark = statusBarStyle !== 'light';

    let result;

    let filters = [];
    if (Array.isArray(scanType) && scanType.length) {
      scanType.forEach(type => { // 暂不考虑去重
        const types = SCAN_TYPES[type];
        if (types) {
          filters = filters.concat(types);
        }
      });
    }
    if (!filters.length) {
      filters = filters.concat(SCAN_TYPES['qrCode']).concat(SCAN_TYPES['barCode']).concat(SCAN_TYPES['datamatrix']).concat(
        SCAN_TYPES['pdf417']);
    }

    const buttons = [];
    if (!onlyFromCamera) {
      buttons.push({
        'float': 'right',
        'text': '相册',
        'fontSize': '17px',
        'width': '60px',
        'onclick': function () {
          plus.gallery.pick(file => {
            barcode.scan(file, (type, code) => {
              if (isDark) {
                plus.navigator.setStatusBarStyle('isDark');
              }
              result = {
                type,
                code
              };
              webview.close('auto');
            }, () => {
              plus.nativeUI.toast('识别失败');
            }, filters);
          }, err => {
            if (err.code !== 12) {
              plus.nativeUI.toast('选择失败');
            }
          }, {
            multiple: false,
            system: false
          });
        }
      });
    }

    const webview = plus.webview.create(SCAN_PATH, SCAN_ID, {
      titleNView: {
        autoBackButton: true,
        type: 'float',
        backgroundColor: 'rgba(0,0,0,0)',
        titleColor: '#ffffff',
        titleText: '扫码',
        titleSize: '17px',
        buttons
      },
      popGesture: 'close',
      backButtonAutoControl: 'close'
    }, {
      __uniapp_type: 'scan',
      __uniapp_dark: isDark,
      __uniapp_scan_type: filters,
      'uni-app': 'none'
    });
    const waiting = plus.nativeUI.showWaiting();
    webview.addEventListener('titleUpdate', () => {
      webview.show(ANI_SHOW, ANI_DURATION, () => {
        waiting.close();
      });
    });
    webview.addEventListener('close', () => {
      if (result) {
        invoke(callbackId, {
          result: result.code,
          scanType: SCAN_MAPS[result.type] || '',
          charSet: 'utf8',
          path: '',
          errMsg: 'scanCode:ok'
        });
      } else {
        invoke(callbackId, {
          errMsg: 'scanCode:fail cancel'
        });
      }
      consumePlusMessage(MESSAGE_TYPE);
    });
    if (isDark) { // 状态栏前景色
      plus.navigator.setStatusBarStyle('light');
      webview.addEventListener('popGesture', ({
        type,
        result
      }) => {
        if (type === 'start') {
          plus.navigator.setStatusBarStyle('dark');
        } else if (type === 'end' && !result) {
          plus.navigator.setStatusBarStyle('light');
        }
      });
    }

    registerPlusMessage(MESSAGE_TYPE, function (res) {
      if (res && 'code' in res) {
        result = res;
      }
    }, false);
  }

  function getSystemInfoSync () {
    return callApiSync(getSystemInfo, Object.create(null), 'getSystemInfo', 'getSystemInfoSync')
  }

  function getSystemInfo () {
    const platform = plus.os.name.toLowerCase();
    const ios = platform === 'ios';
    // 安卓 plus 接口获取的屏幕大小值不为整数，iOS js 获取的屏幕大小横屏时颠倒
    const screenWidth = plus.screen.resolutionWidth;
    const screenHeight = plus.screen.resolutionHeight;
    // 横屏时 iOS 获取的状态栏高度错误，进行纠正
    var landscape = Math.abs(plus.navigator.getOrientation()) === 90;
    var statusBarHeight = Math.round(plus.navigator.getStatusbarHeight());
    if (ios && landscape) {
      statusBarHeight = Math.min(20, statusBarHeight);
    }
    var safeAreaInsets;
    function getSafeAreaInsets () {
      return {
        left: 0,
        right: 0,
        top: titleNView ? 0 : statusBarHeight,
        bottom: 0
      }
    }
    // 判断是否存在 titleNView
    var titleNView;
    var webview = getLastWebview();
    if (webview) {
      let style = webview.getStyle();
      if (style) {
        titleNView = style && style.titleNView;
        titleNView = titleNView && titleNView.type === 'default';
      }
      safeAreaInsets = ios ? webview.getSafeAreaInsets() : getSafeAreaInsets();
    } else {
      safeAreaInsets = ios ? plus.navigator.getSafeAreaInsets() : getSafeAreaInsets();
    }
    var windowHeight = Math.min(screenHeight - (titleNView ? (statusBarHeight + TITLEBAR_HEIGHT)
      : 0) - (isTabBarPage() && tabBar.visible ? TABBAR_HEIGHT : 0), screenHeight);
    var windowWidth = screenWidth;
    var safeArea = {
      left: safeAreaInsets.left,
      right: windowWidth - safeAreaInsets.right,
      top: safeAreaInsets.top,
      bottom: windowHeight - safeAreaInsets.bottom,
      width: windowWidth - safeAreaInsets.left - safeAreaInsets.right,
      height: windowHeight - safeAreaInsets.top - safeAreaInsets.bottom
    };

    return {
      errMsg: 'getSystemInfo:ok',
      brand: plus.device.vendor,
      model: plus.device.model,
      pixelRatio: plus.screen.scale,
      screenWidth,
      screenHeight,
      windowWidth,
      windowHeight,
      statusBarHeight,
      language: plus.os.language,
      system: plus.os.version,
      version: plus.runtime.innerVersion,
      fontSizeSetting: '',
      platform,
      SDKVersion: '',
      windowTop: 0,
      windowBottom: 0,
      safeArea
    }
  }

  function vibrateLong () {
    plus.device.vibrate(400);
    return {
      errMsg: 'vibrateLong:ok'
    }
  }
  function vibrateShort () {
    plus.device.vibrate(15);
    return {
      errMsg: 'vibrateShort:ok'
    }
  }

  const SAVED_DIR = 'uniapp_save';
  const SAVE_PATH = `_doc/${SAVED_DIR}`;
  const REGEX_FILENAME = /^.*[/]/;

  function getSavedFileDir (success, fail) {
    fail = fail || function () {};
    plus.io.requestFileSystem(plus.io.PRIVATE_DOC, fs => { // 请求_doc fs
      fs.root.getDirectory(SAVED_DIR, { // 获取文件保存目录对象
        create: true
      }, dir => {
        success(dir);
      }, err => {
        fail('目录[' + SAVED_DIR + ']创建失败' + err.message);
      });
    }, err => {
      fail('目录[_doc]读取失败' + err.message);
    });
  }

  function saveFile ({
    tempFilePath
  } = {}, callbackId) {
    let fileName = tempFilePath.replace(REGEX_FILENAME, '');
    if (fileName) {
      let extName = '';
      if (~fileName.indexOf('.')) {
        extName = '.' + fileName.split('.').pop();
      }

      fileName = (+new Date()) + '' + extName;

      plus.io.resolveLocalFileSystemURL(getRealPath(tempFilePath), entry => { // 读取临时文件 FileEntry
        getSavedFileDir(dir => {
          entry.copyTo(dir, fileName, () => { // 复制临时文件 FileEntry，为了避免把相册里的文件删除，使用 copy，微信中是要删除临时文件的
            const savedFilePath = SAVE_PATH + '/' + fileName;
            invoke(callbackId, {
              errMsg: 'saveFile:ok',
              savedFilePath
            });
          }, err => {
            invoke(callbackId, {
              errMsg: 'saveFile:fail 保存文件[' + tempFilePath +
                '] copyTo 失败:' + err.message
            });
          });
        }, message => {
          invoke(callbackId, {
            errMsg: 'saveFile:fail ' + message
          });
        });
      }, err => {
        invoke(callbackId, {
          errMsg: 'saveFile:fail 文件[' + tempFilePath + ']读取失败' + err.message
        });
      });
    } else {
      return {
        errMsg: 'saveFile:fail 文件名[' + tempFilePath + ']不存在'
      }
    }
  }

  function getSavedFileList (options, callbackId) {
    getSavedFileDir(entry => {
      var reader = entry.createReader();

      var fileList = [];
      reader.readEntries(entries => {
        if (entries && entries.length) {
          entries.forEach(entry => {
            entry.getMetadata(meta => {
              fileList.push({
                filePath: plus.io.convertAbsoluteFileSystem(entry.fullPath),
                createTime: meta.modificationTime.getTime(),
                size: meta.size
              });
              if (fileList.length === entries.length) {
                invoke(callbackId, {
                  errMsg: 'getSavedFileList:ok',
                  fileList
                });
              }
            }, error => {
              invoke(callbackId, {
                errMsg: 'getSavedFileList:fail ' + error.message
              });
            }, false);
          });
        } else {
          invoke(callbackId, {
            errMsg: 'getSavedFileList:ok',
            fileList
          });
        }
      }, error => {
        invoke(callbackId, {
          errMsg: 'getSavedFileList:fail ' + error.message
        });
      });
    }, message => {
      invoke(callbackId, {
        errMsg: 'getSavedFileList:fail ' + message
      });
    });
  }

  function getFileInfo ({
    filePath,
    digestAlgorithm = 'md5'
  } = {}, callbackId) {
    // TODO 计算文件摘要
    plus.io.resolveLocalFileSystemURL(getRealPath(filePath), entry => {
      entry.getMetadata(meta => {
        invoke(callbackId, {
          errMsg: 'getFileInfo:ok',
          size: meta.size,
          digestAlgorithm: ''
        });
      }, err => {
        invoke(callbackId, {
          errMsg: 'getFileInfo:fail 文件[' +
            filePath +
            '] getMetadata 失败:' + err.message
        });
      });
    }, err => {
      invoke(callbackId, {
        errMsg: 'getFileInfo:fail 文件[' + filePath + ']读取失败:' + err.message
      });
    });
  }

  function getSavedFileInfo ({
    filePath
  } = {}, callbackId) {
    plus.io.resolveLocalFileSystemURL(getRealPath(filePath), entry => {
      entry.getMetadata(meta => {
        invoke(callbackId, {
          createTime: meta.modificationTime.getTime(),
          size: meta.size,
          errMsg: 'getSavedFileInfo:ok'
        });
      }, error => {
        invoke(callbackId, {
          errMsg: 'getSavedFileInfo:fail ' + error.message
        });
      }, false);
    }, () => {
      invoke(callbackId, {
        errMsg: 'getSavedFileInfo:fail file not find'
      });
    });
  }

  function removeSavedFile ({
    filePath
  } = {}, callbackId) {
    plus.io.resolveLocalFileSystemURL(getRealPath(filePath), entry => {
      entry.remove(() => {
        invoke(callbackId, {
          errMsg: 'removeSavedFile:ok'
        });
      }, err => {
        invoke(callbackId, {
          errMsg: 'removeSavedFile:fail 文件[' + filePath + ']删除失败:' + err.message
        });
      });
    }, () => {
      invoke(callbackId, {
        errMsg: 'removeSavedFile:fail file not find'
      });
    });
  }

  function openDocument$1 ({
    filePath,
    fileType
  } = {}, callbackId) {
    plus.io.resolveLocalFileSystemURL(getRealPath(filePath), entry => {
      plus.runtime.openFile(getRealPath(filePath));
      invoke(callbackId, {
        errMsg: 'openDocument:ok'
      });
    }, err => {
      invoke(callbackId, {
        errMsg: 'openDocument:fail 文件[' + filePath + ']读取失败:' + err.message
      });
    });
  }

  const CHOOSE_LOCATION_PATH = '_www/__uniappchooselocation.html';

  const MESSAGE_TYPE$1 = 'chooseLocation';

  function chooseLocation$1 (params, callbackId) {
    const statusBarStyle = plus.navigator.getStatusBarStyle();
    const webview = plus.webview.create(
      CHOOSE_LOCATION_PATH,
      MAP_ID, {
        titleNView: {
          autoBackButton: true,
          backgroundColor: '#000000',
          titleColor: '#ffffff',
          titleText: '选择位置',
          titleSize: '17px',
          buttons: [{
            float: 'right',
            text: '完成',
            fontSize: '17px',
            onclick: function () {
              webview.evalJS('__chooseLocationConfirm__()');
            }
          }]
        },
        popGesture: 'close',
        scrollIndicator: 'none'
      }, {
        __uniapp_type: 'map',
        __uniapp_statusbar_style: statusBarStyle,
        'uni-app': 'none'
      }
    );
    if (statusBarStyle === 'dark') {
      plus.navigator.setStatusBarStyle('light');
      webview.addEventListener('popGesture', ({
        type,
        result
      }) => {
        if (type === 'start') {
          plus.navigator.setStatusBarStyle('dark');
        } else if (type === 'end' && !result) {
          plus.navigator.setStatusBarStyle('light');
        }
      });
    }
    let index = 0;
    let onShow = function () {
      index++;
      if (index === 2) {
        webview.evalJS(`__chooseLocation__(${JSON.stringify(params)})`);
      }
    };
    webview.addEventListener('loaded', onShow);
    webview.show('slide-in-bottom', ANI_DURATION, onShow);

    let result;

    webview.addEventListener('close', () => {
      if (result) {
        invoke(callbackId, {
          name: result.poiname,
          address: result.poiaddress,
          latitude: result.latlng.lat,
          longitude: result.latlng.lng,
          errMsg: 'chooseLocation:ok'
        });
      } else {
        consumePlusMessage(MESSAGE_TYPE$1);
        invoke(callbackId, {
          errMsg: 'chooseLocation:fail cancel'
        });
      }
    });

    registerPlusMessage(MESSAGE_TYPE$1, function (res) {
      if (res && 'latlng' in res) {
        result = res;
      }
    }, false);
  }

  function getLocationSuccess (type, position, callbackId) {
    const coords = position.coords;
    if (type !== position.coordsType) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `UNIAPP[location]:before[${position.coordsType}][lng:${
          coords.longitude
        },lat:${coords.latitude}]`
        );
      }
      let coordArray;
      if (type === 'wgs84') {
        coordArray = gcj02towgs84(coords.longitude, coords.latitude);
      } else if (type === 'gcj02') {
        coordArray = wgs84togcj02(coords.longitude, coords.latitude);
      }
      if (coordArray) {
        coords.longitude = coordArray[0];
        coords.latitude = coordArray[1];
        if (process.env.NODE_ENV !== 'production') {
          console.log(
            `UNIAPP[location]:after[${type}][lng:${coords.longitude},lat:${
            coords.latitude
          }]`
          );
        }
      }
    }

    invoke(callbackId, {
      type,
      altitude: coords.altitude || 0,
      latitude: coords.latitude,
      longitude: coords.longitude,
      speed: coords.speed,
      accuracy: coords.accuracy,
      address: position.address,
      errMsg: 'getLocation:ok'
    });
  }

  function getLocation$1 ({
    type = 'wgs84',
    geocode = false,
    altitude = false
  } = {}, callbackId) {
    plus.geolocation.getCurrentPosition(
      position => {
        getLocationSuccess(type, position, callbackId);
      },
      e => {
        // 坐标地址解析失败
        if (e.code === 1501) {
          getLocationSuccess(type, e, callbackId);
          return
        }

        invoke(callbackId, {
          errMsg: 'getLocation:fail ' + e.message
        });
      }, {
        geocode: geocode,
        enableHighAccuracy: altitude
      }
    );
  }

  const OPEN_LOCATION_PATH = '_www/__uniappopenlocation.html';

  function openLocation$1 (params) {
    const statusBarStyle = plus.navigator.getStatusBarStyle();
    const webview = plus.webview.create(
      OPEN_LOCATION_PATH,
      MAP_ID, {
        titleNView: {
          autoBackButton: true,
          titleColor: '#ffffff',
          titleText: '',
          titleSize: '17px',
          type: 'transparent'
        },
        popGesture: 'close',
        scrollIndicator: 'none'
      }, {
        __uniapp_type: 'map',
        __uniapp_statusbar_style: statusBarStyle,
        'uni-app': 'none'
      }
    );
    if (statusBarStyle === 'light') {
      plus.navigator.setStatusBarStyle('dark');
      webview.addEventListener('popGesture', ({
        type,
        result
      }) => {
        if (type === 'start') {
          plus.navigator.setStatusBarStyle('light');
        } else if (type === 'end' && !result) {
          plus.navigator.setStatusBarStyle('dark');
        }
      });
    }
    webview.show(ANI_SHOW, ANI_DURATION, () => {
      webview.evalJS(`__openLocation__(${JSON.stringify(params)})`);
    });

    return {
      errMsg: 'openLocation:ok'
    }
  }

  const RECORD_TIME = 60 * 60 * 1000;

  let recorder;
  let recordTimeout;

  function startRecord (args, callbackId) {
    recorder && recorder.stop();
    recorder = plus.audio.getRecorder();
    recorder.record({
      filename: '_doc/audio/',
      format: 'aac'
    }, (res) => {
      invoke(callbackId, {
        errMsg: 'startRecord:ok',
        tempFilePath: res
      });
    }, (res) => {
      invoke(callbackId, {
        errMsg: 'startRecord:fail'
      });
    });
    recordTimeout = setTimeout(() => {
      recorder.stop();
      recorder = false;
    }, RECORD_TIME);
  }

  function stopRecord () {
    if (recorder) {
      recordTimeout && clearTimeout(recordTimeout);
      recorder.stop();
      return {
        errMsg: 'stopRecord:ok'
      }
    }
    return {
      errMsg: 'stopRecord:fail'
    }
  }

  let player;
  let playerFilePath;
  let playerStatus;

  function playVoice ({
    filePath
  } = {}, callbackId) {
    if (player && playerFilePath === filePath && playerStatus === 'pause') { // 如果是当前音频被暂停，则继续播放
      playerStatus = 'play';
      player.play((res) => {
        player = false;
        playerFilePath = false;
        playerStatus = false;
        invoke(callbackId, {
          errMsg: 'playVoice:ok'
        });
      });
      return {
        errMsg: 'playVoice:ok'
      }
    }
    if (player) { // 如果存在音频播放，则停止
      player.stop();
    }
    playerFilePath = filePath;
    playerStatus = 'play';
    player = plus.audio.createPlayer(getRealPath(filePath));
    // 播放操作成功回调
    player.play((res) => {
      player = false;
      playerFilePath = false;
      playerStatus = false;
      invoke(callbackId, {
        errMsg: 'playVoice:ok'
      });
    });
  }

  function pauseVoice () {
    if (player && playerStatus === 'play') {
      player.pause();
      playerStatus = 'pause';
    }
    return {
      errMsg: 'pauseVoice:ok'
    }
  }

  function stopVoice () {
    if (player) {
      player.stop();
      player = false;
      playerFilePath = false;
      playerStatus = false;
    }
    return {
      errMsg: 'stopVoice:ok'
    }
  }

  /**
   * 获取文件信息
   * @param {string} filePath 文件路径
   * @returns {Promise} 文件信息Promise
   */
  function getFileInfo$1 (filePath) {
    return new Promise((resolve, reject) => {
      plus.io.resolveLocalFileSystemURL(filePath, function (entry) {
        entry.getMetadata(function (meta) {
          resolve({
            size: meta.size
          });
        }, reject, false);
      }, reject);
    })
  }

  const invokeChooseImage = function (callbackId, type, sizeType, tempFilePaths = []) {
    if (!tempFilePaths.length) {
      invoke(callbackId, {
        code: sizeType,
        errMsg: `chooseImage:${type}`
      });
      return
    }
    var tempFiles = [];
    // plus.zip.compressImage 压缩文件并发调用在iOS端容易出现问题（图像错误、闪退），改为队列执行
    tempFilePaths.reduce((promise, tempFilePath, index, array) => {
      return promise
        .then(() => {
          return getFileInfo$1(tempFilePath)
        })
        .then(fileInfo => {
          var size = fileInfo.size;
          // 压缩阈值 0.5 兆
          var threshold = 1024 * 1024 * 0.5;
          // 判断是否需要压缩
          if ((sizeType.indexOf('compressed') >= 0 && sizeType.indexOf('original') < 0) || (((
            sizeType.indexOf(
              'compressed') < 0 && sizeType.indexOf('original') < 0) || (sizeType
            .indexOf('compressed') >= 0 && sizeType.indexOf(
            'original') >= 0)) && size > threshold)) {
            return new Promise((resolve, reject) => {
              var dstPath = TEMP_PATH + '/compressed/' + Date.now() + (
                tempFilePath.match(/\.\S+$/) || [''])[0];
              plus.nativeUI.showWaiting();
              plus.zip.compressImage({
                src: tempFilePath,
                dst: dstPath,
                overwrite: true
              }, () => {
                resolve(dstPath);
              }, (error) => {
                reject(error);
              });
            })
              .then(dstPath => {
                array[index] = tempFilePath = dstPath;
                return getFileInfo$1(tempFilePath)
              })
              .then(fileInfo => {
                return tempFiles.push({
                  path: tempFilePath,
                  size: fileInfo.size
                })
              })
          }
          return tempFiles.push({
            path: tempFilePath,
            size: size
          })
        })
    }, Promise.resolve())
      .then(() => {
        plus.nativeUI.closeWaiting();
        invoke(callbackId, {
          errMsg: `chooseImage:${type}`,
          tempFilePaths,
          tempFiles
        });
      }).catch(() => {
        plus.nativeUI.closeWaiting();
        invoke(callbackId, {
          errMsg: `chooseImage:${type}`
        });
      });
  };
  const openCamera = function (callbackId, sizeType) {
    const camera = plus.camera.getCamera();
    camera.captureImage(e => invokeChooseImage(callbackId, 'ok', sizeType, [e]),
      e => invokeChooseImage(callbackId, 'fail', 1), {
        filename: TEMP_PATH + '/camera/'
      });
  };
  const openAlbum = function (callbackId, sizeType, count) {
    // TODO Android 需要拷贝到 temp 目录
    plus.gallery.pick(e => invokeChooseImage(callbackId, 'ok', sizeType, e.files.map(file => {
      return file
    })), e => {
      invokeChooseImage(callbackId, 'fail', 2);
    }, {
      maximum: count,
      multiple: true,
      system: false,
      filename: TEMP_PATH + '/gallery/'
    });
  };

  function chooseImage$1 ({
    count = 9,
    sizeType = ['original', 'compressed'],
    sourceType = ['album', 'camera']
  } = {}, callbackId) {
    let fallback = true;
    if (sourceType.length === 1) {
      if (sourceType[0] === 'album') {
        fallback = false;
        openAlbum(callbackId, sizeType, count);
      } else if (sourceType[0] === 'camera') {
        fallback = false;
        openCamera(callbackId, sizeType);
      }
    }
    if (fallback) {
      plus.nativeUI.actionSheet({
        cancel: '取消',
        buttons: [{
          title: '拍摄'
        }, {
          title: '从手机相册选择'
        }]
      }, (e) => {
        switch (e.index) {
          case 0:
            invokeChooseImage(callbackId, 'fail', 0);
            break
          case 1:
            openCamera(callbackId, sizeType);
            break
          case 2:
            openAlbum(callbackId, sizeType, count);
            break
        }
      });
    }
  }

  const invokeChooseVideo = function (callbackId, type, tempFilePath = '') {
    let callbackResult = {
      errMsg: `chooseVideo:${type}`,
      tempFilePath: tempFilePath,
      duration: 0,
      size: 0,
      height: 0,
      width: 0
    };

    if (type !== 'ok') {
      invoke(callbackId, callbackResult);
      return
    }

    plus.io.getVideoInfo({
      filePath: tempFilePath,
      success (videoInfo) {
        callbackResult.size = videoInfo.size;
        callbackResult.duration = videoInfo.duration;
        callbackResult.width = videoInfo.width;
        callbackResult.height = videoInfo.height;
        invoke(callbackId, callbackResult);
      },
      fail () {
        invoke(callbackId, callbackResult);
      },
      complete () {
        invoke(callbackId, callbackResult);
      }
    });
  };
  const openCamera$1 = function (callbackId, maxDuration, cameraIndex) {
    const camera = plus.camera.getCamera();
    camera.startVideoCapture(e => invokeChooseVideo(callbackId, 'ok', e), e => invokeChooseVideo(
      callbackId, 'fail'), {
      index: cameraIndex,
      videoMaximumDuration: maxDuration,
      filename: TEMP_PATH + '/camera/'
    });
  };
  const openAlbum$1 = function (callbackId) {
    plus.gallery.pick(e => {
      invokeChooseVideo(callbackId, 'ok', e);
    }, e => invokeChooseVideo(callbackId, 'fail'), {
      filter: 'video',
      system: false,
      filename: TEMP_PATH + '/gallery/'
    });
  };
  function chooseVideo$1 ({
    sourceType = ['album', 'camera'],
    maxDuration = 60,
    camera = 'back'
  } = {}, callbackId) {
    let fallback = true;
    let cameraIndex = (camera === 'front') ? 2 : 1;
    if (sourceType.length === 1) {
      if (sourceType[0] === 'album') {
        fallback = false;
        openAlbum$1(callbackId);
      } else if (sourceType[0] === 'camera') {
        fallback = false;
        openCamera$1(callbackId, maxDuration, cameraIndex);
      }
    }
    if (fallback) {
      plus.nativeUI.actionSheet({
        cancel: '取消',
        buttons: [{
          title: '拍摄'
        }, {
          title: '从手机相册选择'
        }]
      }, e => {
        switch (e.index) {
          case 0:
            invokeChooseVideo(callbackId, 'fail');
            break
          case 1:
            openCamera$1(callbackId, maxDuration, cameraIndex);
            break
          case 2:
            openAlbum$1(callbackId);
            break
        }
      });
    }
  }

  function compressImage ({
    src,
    quality
  }, callbackId) {
    var dst = TEMP_PATH + '/compressed/' + Date.now() + (src.match(/\.\S+$/) || [''])[0];
    plus.zip.compressImage({
      src,
      dst,
      quality
    }, () => {
      invoke(callbackId, {
        errMsg: `compressImage:ok`,
        tempFilePath: dst
      });
    }, () => {
      invoke(callbackId, {
        errMsg: `compressImage:fail`
      });
    });
  }

  function getImageInfo$1 ({
    src
  } = {}, callbackId) {
    // fixed by hxy
    plus.io.getImageInfo({
      src,
      success (imageInfo) {
        invoke(callbackId, {
          errMsg: 'getImageInfo:ok',
          ...imageInfo
        });
      },
      fail () {
        invoke(callbackId, {
          errMsg: 'getImageInfo:fail'
        });
      }
    });
  }

  function previewImage$1 ({
    current = 0,
    background = '#000000',
    indicator = 'number',
    loop = false,
    urls,
    longPressActions
  } = {}) {
    urls = urls.map(url => getRealPath(url));

    const index = Number(current);
    if (isNaN(index)) {
      current = urls.indexOf(getRealPath(current));
      current = current < 0 ? 0 : current;
    } else {
      current = index;
    }

    plus.nativeUI.previewImage(urls, {
      current,
      background,
      indicator,
      loop,
      onLongPress: function (res) {
        let itemList = [];
        let itemColor = '';
        let title = '';
        let hasLongPressActions = longPressActions && longPressActions.callbackId;
        if (!hasLongPressActions) {
          itemList = ['保存相册'];
          itemColor = '#000000';
          title = '';
        } else {
          itemList = longPressActions.itemList ? longPressActions.itemList : [];
          itemColor = longPressActions.itemColor ? longPressActions.itemColor : '#000000';
          title = longPressActions.title ? longPressActions.title : '';
        }

        const options = {
          buttons: itemList.map(item => ({
            title: item,
            color: itemColor
          })),
          cancel: '取消'
        };
        if (title) {
          options.title = title;
        }
        // if (plus.os.name === 'iOS') {
        //   options.cancel = '取消'
        // }
        plus.nativeUI.actionSheet(options, (e) => {
          if (e.index > 0) {
            if (hasLongPressActions) {
              publish(longPressActions.callbackId, {
                errMsg: 'showActionSheet:ok',
                tapIndex: e.index - 1,
                index: res.index
              });
              return
            }
            plus.gallery.save(res.url, function (GallerySaveEvent) {
              plus.nativeUI.toast('保存图片到相册成功');
            });
          } else if (hasLongPressActions) {
            publish(longPressActions.callbackId, {
              errMsg: 'showActionSheet:fail cancel'
            });
          }
        });
      }
    });
    return {
      errMsg: 'previewImage:ok'
    }
  }

  let recorder$1;
  let recordTimeout$1;

  const publishRecorderStateChange = (state, res = {}) => {
    publish('onRecorderStateChange', Object.assign({
      state
    }, res));
  };

  const Recorder = {
    start ({
      duration = 60000,
      sampleRate,
      numberOfChannels,
      encodeBitRate,
      format = 'mp3',
      frameSize,
      audioSource = 'auto'
    }, callbackId) {
      if (recorder$1) {
        return publishRecorderStateChange('start')
      }
      recorder$1 = plus.audio.getRecorder();
      recorder$1.record({
        format,
        samplerate: sampleRate,
        filename: TEMP_PATH + '/recorder/'
      }, res => publishRecorderStateChange('stop', {
        tempFilePath: res
      }), err => publishRecorderStateChange('error', {
        errMsg: err.message
      }));
      recordTimeout$1 = setTimeout(() => {
        Recorder.stop();
      }, duration);
      publishRecorderStateChange('start');
    },
    stop () {
      if (recorder$1) {
        recorder$1.stop();
        recorder$1 = false;
        recordTimeout$1 && clearTimeout(recordTimeout$1);
      }
    },
    pause () {
      if (recorder$1) {
        publishRecorderStateChange('error', {
          errMsg: '暂不支持录音pause操作'
        });
      }
    },
    resume () {
      if (recorder$1) {
        publishRecorderStateChange('error', {
          errMsg: '暂不支持录音resume操作'
        });
      }
    }
  };

  function operateRecorder ({
    operationType,
    ...args
  }, callbackId) {
    Recorder[operationType](args);
    return {
      errMsg: 'operateRecorder:ok'
    }
  }

  function saveImageToPhotosAlbum ({
    filePath
  } = {}, callbackId) {
    plus.gallery.save(getRealPath(filePath), e => {
      invoke(callbackId, {
        errMsg: 'saveImageToPhotosAlbum:ok'
      });
    }, e => {
      invoke(callbackId, {
        errMsg: 'saveImageToPhotosAlbum:fail'
      });
    });
  }

  function saveVideoToPhotosAlbum ({
    filePath
  } = {}, callbackId) {
    plus.gallery.save(getRealPath(filePath), e => {
      invoke(callbackId, {
        errMsg: 'saveVideoToPhotosAlbum:ok'
      });
    }, e => {
      invoke(callbackId, {
        errMsg: 'saveVideoToPhotosAlbum:fail'
      });
    });
  }

  let downloadTaskId = 0;
  const downloadTasks = {};

  const publishStateChange = (res) => {
    publish('onDownloadTaskStateChange', res);
  };

  const createDownloadTaskById = function (downloadTaskId, {
    url,
    header
  } = {}) {
    const downloader = plus.downloader.createDownload(url, {
      time: __uniConfig.networkTimeout.downloadFile ? __uniConfig.networkTimeout.downloadFile / 1000 : 120,
      filename: TEMP_PATH + '/download/',
      // 需要与其它平台上的表现保持一致，不走重试的逻辑。
      retry: 0,
      retryInterval: 0
    }, (download, statusCode) => {
      if (statusCode) {
        publishStateChange({
          downloadTaskId,
          state: 'success',
          tempFilePath: download.filename,
          statusCode
        });
      } else {
        publishStateChange({
          downloadTaskId,
          state: 'fail',
          statusCode
        });
      }
    });
    for (const name in header) {
      if (header.hasOwnProperty(name)) {
        downloader.setRequestHeader(name, header[name]);
      }
    }
    downloader.addEventListener('statechanged', (download, status) => {
      if (download.downloadedSize && download.totalSize) {
        publishStateChange({
          downloadTaskId,
          state: 'progressUpdate',
          progress: parseInt(download.downloadedSize / download.totalSize * 100),
          totalBytesWritten: download.downloadedSize,
          totalBytesExpectedToWrite: download.totalSize
        });
      }
    });
    downloadTasks[downloadTaskId] = downloader;
    downloader.start();
    return {
      downloadTaskId,
      errMsg: 'createDownloadTask:ok'
    }
  };

  function operateDownloadTask ({
    downloadTaskId,
    operationType
  } = {}) {
    const downloadTask = downloadTasks[downloadTaskId];
    if (downloadTask && operationType === 'abort') {
      delete downloadTasks[downloadTaskId];
      downloadTask.abort();
      publishStateChange({
        downloadTaskId,
        state: 'fail',
        errMsg: 'abort'
      });
      return {
        errMsg: 'operateDownloadTask:ok'
      }
    }
    return {
      errMsg: 'operateDownloadTask:fail'
    }
  }

  function createDownloadTask (args) {
    return createDownloadTaskById(++downloadTaskId, args)
  }

  let requestTaskId = 0;
  const requestTasks = {};

  const publishStateChange$1 = res => {
    publish('onRequestTaskStateChange', res);
    delete requestTasks[requestTaskId];
  };

  function createRequestTaskById (requestTaskId, {
    url,
    data,
    header,
    method = 'GET',
    responseType,
    sslVerify = true
  } = {}) {
    const stream = requireNativePlugin('stream');
    const headers = {};

    let abortTimeout;
    let aborted;
    let hasContentType = false;
    for (const name in header) {
      if (!hasContentType && name.toLowerCase() === 'content-type') {
        hasContentType = true;
        headers['Content-Type'] = header[name];
      } else {
        headers[name] = header[name];
      }
    }

    if (!hasContentType && method === 'POST') {
      headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    }

    const timeout = __uniConfig.networkTimeout.request;
    if (timeout) {
      abortTimeout = setTimeout(() => {
        aborted = true;
        publishStateChange$1({
          requestTaskId,
          state: 'fail',
          statusCode: 0,
          errMsg: 'timeout'
        });
      }, timeout);
    }
    const options = {
      method,
      url: url.trim(),
      // weex 官方文档有误，headers 类型实际 object，用 string 类型会无响应
      headers,
      type: responseType === 'arraybuffer' ? 'base64' : 'text',
      // weex 官方文档未说明实际支持 timeout，单位：ms
      timeout: timeout || 6e5,
      // 配置和weex模块内相反
      sslVerify: !sslVerify
    };
    if (method !== 'GET') {
      options.body = data;
    }
    try {
      stream.fetch(options, ({
        ok,
        status,
        data,
        headers
      }) => {
        if (aborted) {
          return
        }
        if (abortTimeout) {
          clearTimeout(abortTimeout);
        }
        const statusCode = status;
        if (statusCode > 0) {
          publishStateChange$1({
            requestTaskId,
            state: 'success',
            data: ok && responseType === 'arraybuffer' ? base64ToArrayBuffer(data) : data,
            statusCode,
            header: headers
          });
        } else {
          publishStateChange$1({
            requestTaskId,
            state: 'fail',
            statusCode,
            errMsg: 'abort'
          });
        }
      });
      requestTasks[requestTaskId] = {
        abort () {
          aborted = true;
          if (abortTimeout) {
            clearTimeout(abortTimeout);
          }
          publishStateChange$1({
            requestTaskId,
            state: 'fail',
            statusCode: 0,
            errMsg: 'abort'
          });
        }
      };
    } catch (e) {
      return {
        requestTaskId,
        errMsg: 'createRequestTask:fail'
      }
    }
    return {
      requestTaskId,
      errMsg: 'createRequestTask:ok'
    }
  }

  function createRequestTask (args) {
    return createRequestTaskById(++requestTaskId, args)
  }

  function operateRequestTask ({
    requestTaskId,
    operationType
  } = {}) {
    const requestTask = requestTasks[requestTaskId];
    if (requestTask && operationType === 'abort') {
      requestTask.abort();
      return {
        errMsg: 'operateRequestTask:ok'
      }
    }
    return {
      errMsg: 'operateRequestTask:fail'
    }
  }

  const socketTasks = {};

  const publishStateChange$2 = (res) => {
    publish('onSocketTaskStateChange', res);
  };

  let socket;
  function getSocket () {
    if (socket) {
      return socket
    }
    socket = requireNativePlugin('uni-webSocket');
    socket.onopen(function (e) {
      publishStateChange$2({
        socketTaskId: e.id,
        state: 'open'
      });
    });
    socket.onmessage(function (e) {
      const data = e.data;
      publishStateChange$2({
        socketTaskId: e.id,
        state: 'message',
        data: typeof data === 'object' ? base64ToArrayBuffer(data.base64) : data
      });
    });
    socket.onerror(function (e) {
      publishStateChange$2({
        socketTaskId: e.id,
        state: 'error',
        errMsg: e.data
      });
    });
    socket.onclose(function (e) {
      const socketTaskId = e.id;
      delete socketTasks[socketTaskId];
      publishStateChange$2({
        socketTaskId,
        state: 'close'
      });
    });
    return socket
  }

  const createSocketTaskById = function (socketTaskId, {
    url,
    data,
    header,
    method,
    protocols
  } = {}) {
    const socket = getSocket();
    socket.WebSocket({
      id: socketTaskId,
      url,
      protocol: Array.isArray(protocols) ? protocols.join(',') : protocols
    });
    socketTasks[socketTaskId] = socket;
    return {
      socketTaskId,
      errMsg: 'createSocketTask:ok'
    }
  };

  function createSocketTask (args) {
    return createSocketTaskById(String(Date.now()), args)
  }

  function operateSocketTask (args) {
    const {
      operationType,
      code,
      reason,
      data,
      socketTaskId
    } = unpack(args);
    const socket = socketTasks[socketTaskId];
    if (!socket) {
      return {
        errMsg: 'operateSocketTask:fail'
      }
    }
    switch (operationType) {
      case 'send':
        if (data) {
          socket.send({
            id: socketTaskId,
            data: typeof data === 'object' ? {
              '@type': 'binary',
              base64: arrayBufferToBase64(data)
            } : data
          });
        }
        return {
          errMsg: 'operateSocketTask:ok'
        }
      case 'close':
        socket.close({
          id: socketTaskId,
          code,
          reason
        });
        delete socketTasks[socketTaskId];
        return {
          errMsg: 'operateSocketTask:ok'
        }
    }
    return {
      errMsg: 'operateSocketTask:fail'
    }
  }

  let uploadTaskId = 0;
  const uploadTasks = {};

  const publishStateChange$3 = (res) => {
    publish('onUploadTaskStateChange', res);
  };

  const createUploadTaskById = function (uploadTaskId, {
    url,
    filePath,
    name,
    files,
    header,
    formData
  } = {}) {
    const uploader = plus.uploader.createUpload(url, {
      timeout: __uniConfig.networkTimeout.uploadFile ? __uniConfig.networkTimeout.uploadFile / 1000 : 120,
      // 需要与其它平台上的表现保持一致，不走重试的逻辑。
      retry: 0,
      retryInterval: 0
    }, (upload, statusCode) => {
      if (statusCode) {
        publishStateChange$3({
          uploadTaskId,
          state: 'success',
          data: upload.responseText,
          statusCode
        });
      } else {
        publishStateChange$3({
          uploadTaskId,
          state: 'fail',
          data: '',
          statusCode
        });
      }
      delete uploadTasks[uploadTaskId];
    });

    for (const name in header) {
      if (header.hasOwnProperty(name)) {
        uploader.setRequestHeader(name, header[name]);
      }
    }
    for (const name in formData) {
      if (formData.hasOwnProperty(name)) {
        uploader.addData(name, formData[name]);
      }
    }
    if (files && files.length) {
      files.forEach(file => {
        uploader.addFile(getRealPath(file.uri), {
          key: file.name || 'file'
        });
      });
    } else {
      uploader.addFile(getRealPath(filePath), {
        key: name
      });
    }
    uploader.addEventListener('statechanged', (upload, status) => {
      if (upload.uploadedSize && upload.totalSize) {
        publishStateChange$3({
          uploadTaskId,
          state: 'progressUpdate',
          progress: parseInt(upload.uploadedSize / upload.totalSize * 100),
          totalBytesSent: upload.uploadedSize,
          totalBytesExpectedToSend: upload.totalSize
        });
      }
    });
    uploadTasks[uploadTaskId] = uploader;
    uploader.start();
    return {
      uploadTaskId,
      errMsg: 'createUploadTask:ok'
    }
  };

  function operateUploadTask ({
    uploadTaskId,
    operationType
  } = {}) {
    const uploadTask = uploadTasks[uploadTaskId];
    if (uploadTask && operationType === 'abort') {
      delete uploadTasks[uploadTaskId];
      uploadTask.abort();
      publishStateChange$3({
        uploadTaskId,
        state: 'fail',
        errMsg: 'abort'
      });
      return {
        errMsg: 'operateUploadTask:ok'
      }
    }
    return {
      errMsg: 'operateUploadTask:fail'
    }
  }

  function createUploadTask (args) {
    return createUploadTaskById(++uploadTaskId, args)
  }

  const providers = {
    oauth (callback) {
      plus.oauth.getServices(services => {
        const provider = [];
        services.forEach(({
          id
        }) => {
          provider.push(id);
        });
        callback(null, provider);
      }, err => {
        callback(err);
      });
    },
    share (callback) {
      plus.share.getServices(services => {
        const provider = [];
        services.forEach(({
          id
        }) => {
          provider.push(id);
        });
        callback(null, provider);
      }, err => {
        callback(err);
      });
    },
    payment (callback) {
      plus.payment.getChannels(services => {
        const provider = [];
        services.forEach(({
          id
        }) => {
          provider.push(id);
        });
        callback(null, provider);
      }, err => {
        callback(err);
      });
    },
    push (callback) {
      if (typeof weex !== 'undefined' || typeof plus !== 'undefined') {
        callback(null, [plus.push.getClientInfo().id]);
      } else {
        callback(null, []);
      }
    }
  };

  function getProvider$1 ({
    service
  }, callbackId) {
    if (providers[service]) {
      providers[service]((err, provider) => {
        if (err) {
          invoke(callbackId, {
            errMsg: 'getProvider:fail:' + err.message
          });
        } else {
          invoke(callbackId, {
            errMsg: 'getProvider:ok',
            service,
            provider
          });
        }
      });
    } else {
      invoke(callbackId, {
        errMsg: 'getProvider:fail:服务[' + service + ']不支持'
      });
    }
  }

  const loginServices = {};

  const loginByService = (provider, callbackId) => {
    function login () {
      loginServices[provider].login(res => {
        const authResult = res.target.authResult;
        invoke(callbackId, {
          code: authResult.code,
          authResult: authResult,
          errMsg: 'login:ok'
        });
      }, err => {
        invoke(callbackId, {
          code: err.code,
          errMsg: 'login:fail:' + err.message
        });
      });
    }
    // 先注销再登录
    loginServices[provider].logout(login, login);
  };
  /**
   * 微信登录
   */
  function login (params, callbackId) {
    const provider = params.provider || 'weixin';
    if (loginServices[provider]) {
      loginByService(provider, callbackId);
    } else {
      plus.oauth.getServices(services => {
        loginServices[provider] = services.find(({
          id
        }) => id === provider);
        if (!loginServices[provider]) {
          invoke(callbackId, {
            code: '',
            errMsg: 'login:fail:登录服务[' + provider + ']不存在'
          });
        } else {
          loginByService(provider, callbackId);
        }
      }, err => {
        invoke(callbackId, {
          code: err.code,
          errMsg: 'login:fail:' + err.message
        });
      });
    }
  }

  function getUserInfo (params, callbackId) {
    const provider = params.provider || 'weixin';
    const loginService = loginServices[provider];
    if (!loginService || !loginService.authResult) {
      return invoke(callbackId, {
        errMsg: 'operateWXData:fail:请先调用 uni.login'
      })
    }
    loginService.getUserInfo(res => {
      let userInfo;
      if (provider === 'weixin') {
        const wechatUserInfo = loginService.userInfo;
        userInfo = {
          openId: wechatUserInfo.openid,
          nickName: wechatUserInfo.nickname,
          gender: wechatUserInfo.sex,
          city: wechatUserInfo.city,
          province: wechatUserInfo.province,
          country: wechatUserInfo.country,
          avatarUrl: wechatUserInfo.headimgurl,
          unionId: wechatUserInfo.unionid
        };
      } else {
        loginService.userInfo.openId = loginService.userInfo.openId || loginService.userInfo.openid ||
                  loginService.authResult.openid;
        loginService.userInfo.nickName = loginService.userInfo.nickName || loginService.userInfo.nickname;
        loginService.userInfo.avatarUrl = loginService.userInfo.avatarUrl || loginService.userInfo.avatarUrl ||
                  loginService.userInfo.headimgurl;
        userInfo = loginService.userInfo;
      }
      const result = {
        errMsg: 'operateWXData:ok'
      };
      if (params.data && params.data.api_name === 'webapi_getuserinfo') {
        result.data = {
          data: JSON.stringify(userInfo),
          rawData: '',
          signature: '',
          encryptedData: '',
          iv: ''
        };
      } else {
        result.userInfo = userInfo;
      }
      invoke(callbackId, result);
    }, err => {
      invoke(callbackId, {
        errMsg: 'operateWXData:fail:' + err.message
      });
    });
  }

  /**
   * 获取用户信息
   */
  function operateWXData (params, callbackId) {
    switch (params.data.api_name) {
      case 'webapi_getuserinfo':
        getUserInfo(params, callbackId);
        break
      default:
        return {
          errMsg: 'operateWXData:fail'
        }
    }
  }

  function requestPayment (params, callbackId) {
    const provider = params.provider;
    plus.payment.getChannels(services => {
      const service = services.find(({
        id
      }) => id === provider);
      if (!service) {
        invoke(callbackId, {
          errMsg: 'requestPayment:fail:支付服务[' + provider + ']不存在'
        });
      } else {
        plus.payment.request(service, params.orderInfo, res => {
          invoke(callbackId, {
            errMsg: 'requestPayment:ok'
          });
        }, err => {
          invoke(callbackId, {
            errMsg: 'requestPayment:fail:' + err.message
          });
        });
      }
    }, err => {
      invoke(callbackId, {
        errMsg: 'requestPayment:fail:' + err.message
      });
    });
  }

  let onPushing;

  let isListening = false;

  let unsubscribe = false;

  function subscribePush (params, callbackId) {
    const clientInfo = plus.push.getClientInfo();
    if (clientInfo) {
      if (!isListening) {
        isListening = true;
        plus.push.addEventListener('receive', msg => {
          if (onPushing && !unsubscribe) {
            publish('onPushMessage', {
              messageId: msg.__UUID__,
              data: msg.payload,
              errMsg: 'onPush:ok'
            });
          }
        });
      }
      unsubscribe = false;
      clientInfo.errMsg = 'subscribePush:ok';
      return clientInfo
    } else {
      return {
        errMsg: 'subscribePush:fail:请确保当前运行环境已包含 push 模块'
      }
    }
  }

  function unsubscribePush (params) {
    unsubscribe = true;
    return {
      errMsg: 'unsubscribePush:ok'
    }
  }

  function onPush () {
    if (!isListening) {
      return {
        errMsg: 'onPush:fail:请先调用 uni.subscribePush'
      }
    }
    if (plus.push.getClientInfo()) {
      onPushing = true;
      return {
        errMsg: 'onPush:ok'
      }
    }
    return {
      errMsg: 'onPush:fail:请确保当前运行环境已包含 push 模块'
    }
  }

  function offPush (params) {
    onPushing = false;
    return {
      errMsg: 'offPush:ok'
    }
  }

  // 0:图文，1:纯文字，2:纯图片，3:音乐，4:视频，5:小程序
  const TYPES = {
    '0': {
      name: 'web',
      title: '图文'
    },
    '1': {
      name: 'text',
      title: '纯文字'
    },
    '2': {
      name: 'image',
      title: '纯图片'
    },
    '3': {
      name: 'music',
      title: '音乐'
    },
    '4': {
      name: 'video',
      title: '视频'
    },
    '5': {
      name: 'miniProgram',
      title: '小程序'
    }
  };

  const parseParams = (args, callbackId, method) => {
    args.type = args.type || 0;

    let {
      provider,
      type,
      title,
      summary: content,
      href,
      imageUrl,
      mediaUrl: media,
      scene,
      miniProgram
    } = args;

    if (typeof imageUrl === 'string' && imageUrl) {
      imageUrl = getRealPath(imageUrl);
    }

    const shareType = TYPES[type + ''];
    if (shareType) {
      let sendMsg = {
        provider,
        type: shareType.name,
        title,
        content,
        href,
        pictures: [imageUrl],
        thumbs: [imageUrl],
        media,
        miniProgram,
        extra: {
          scene
        }
      };
      if (provider === 'weixin' && (type === 1 || type === 2)) {
        delete sendMsg.thumbs;
      }
      return sendMsg
    }
    return '分享参数 type 不正确'
  };

  const sendShareMsg = function (service, params, callbackId, method = 'share') {
    service.send(
      params,
      () => {
        invoke(callbackId, {
          errMsg: method + ':ok'
        });
      },
      err => {
        invoke(callbackId, {
          errMsg: method + ':fail:' + err.message
        });
      }
    );
  };

  function shareAppMessageDirectly ({
    title,
    path,
    imageUrl,
    useDefaultSnapshot
  }, callbackId) {
    title = title || __uniConfig.appname;
    const goShare = () => {
      share({
        provider: 'weixin',
        type: 0,
        title,
        imageUrl,
        href: path,
        scene: 'WXSceneSession'
      },
      callbackId,
      'shareAppMessageDirectly'
      );
    };
    if (useDefaultSnapshot) {
      const pages = getCurrentPages();
      const webview = plus.webview.getWebviewById(pages[pages.length - 1].__wxWebviewId__ + '');
      if (webview) {
        const bitmap = new plus.nativeObj.Bitmap();
        webview.draw(
          bitmap,
          () => {
            const fileName = TEMP_PATH + '/share/snapshot.jpg';
            bitmap.save(
              fileName, {
                overwrite: true,
                format: 'jpg'
              },
              () => {
                imageUrl = fileName;
                goShare();
              },
              err => {
                invoke(callbackId, {
                  errMsg: 'shareAppMessageDirectly:fail:' + err.message
                });
              }
            );
          },
          err => {
            invoke(callbackId, {
              errMsg: 'shareAppMessageDirectly:fail:' + err.message
            });
          }
        );
      } else {
        goShare();
      }
    } else {
      goShare();
    }
  }

  function share (params, callbackId, method = 'share') {
    params = parseParams(params);
    if (typeof params === 'string') {
      return invoke(callbackId, {
        errMsg: method + ':fail:' + params
      })
    }
    const provider = params.provider;
    plus.share.getServices(
      services => {
        const service = services.find(({
          id
        }) => id === provider);
        if (!service) {
          invoke(callbackId, {
            errMsg: method + ':fail:分享服务[' + provider + ']不存在'
          });
        } else {
          if (service.authenticated) {
            sendShareMsg(service, params, callbackId);
          } else {
            service.authorize(
              () => sendShareMsg(service, params, callbackId),
              err => {
                invoke(callbackId, {
                  errMsg: method + ':fail:' + err.message
                });
              }
            );
          }
        }
      },
      err => {
        invoke(callbackId, {
          errMsg: method + ':fail:' + err.message
        });
      }
    );
  }

  function showKeyboard () {
    plus.key.showSoftKeybord();
    return {
      errMsg: 'showKeyboard:ok'
    }
  }

  function hideKeyboard () {
    plus.key.hideSoftKeybord();
    return {
      errMsg: 'hideKeyboard:ok'
    }
  }

  function setNavigationBarTitle$1 ({
    title = ''
  } = {}) {
    const webview = getLastWebview();
    if (webview) {
      const style = webview.getStyle();
      if (style && style.titleNView) {
        webview.setStyle({
          titleNView: {
            titleText: title
          }
        });
      }
      return {
        errMsg: 'setNavigationBarTitle:ok'
      }
    }
    return {
      errMsg: 'setNavigationBarTitle:fail'
    }
  }

  function showNavigationBarLoading () {
    plus.nativeUI.showWaiting('', {
      modal: false
    });
    return {
      errMsg: 'showNavigationBarLoading:ok'
    }
  }

  function hideNavigationBarLoading () {
    plus.nativeUI.closeWaiting();
    return {
      errMsg: 'hideNavigationBarLoading:ok'
    }
  }

  function setNavigationBarColor$1 ({
    frontColor,
    backgroundColor
  } = {}) {
    const webview = getLastWebview();
    if (webview) {
      const styles = {};
      if (frontColor) {
        styles.titleColor = frontColor;
      }
      if (backgroundColor) {
        styles.backgroundColor = backgroundColor;
      }
      plus.navigator.setStatusBarStyle(frontColor === '#000000' ? 'dark' : 'light');
      const style = webview.getStyle();
      if (style && style.titleNView) {
        webview.setStyle({
          titleNView: styles
        });
      }
      return {
        errMsg: 'setNavigationBarColor:ok'
      }
    }
    return {
      errMsg: 'setNavigationBarColor:fail'
    }
  }

  let waiting;
  let waitingTimeout;
  let toast = false;
  let toastTimeout;

  function showLoading$1 (args) {
    return callApiSync(showToast$1, args, 'showToast', 'showLoading')
  }

  function hideLoading () {
    return callApiSync(hideToast, Object.create(null), 'hideToast', 'hideLoading')
  }

  function showToast$1 ({
    title = '',
    icon = 'success',
    image = '',
    duration = 1500,
    mask = false,
    position = ''
  } = {}) {
    if (position) {
      if (toast) {
        toastTimeout && clearTimeout(toastTimeout);
        plus.nativeUI.closeToast();
      }
      if (waiting) {
        waitingTimeout && clearTimeout(waitingTimeout);
        waiting.close();
      }
      if (~['top', 'center', 'bottom'].indexOf(position)) {
        let richText = `<span>${title}</span>`;
        plus.nativeUI.toast(richText, {
          verticalAlign: position,
          type: 'richtext'
        });
        toast = true;
        toastTimeout = setTimeout(() => {
          hideToast();
        }, 2000);
        return {
          errMsg: 'showToast:ok'
        }
      }
      console.warn('uni.showToast 传入的 "position" 值 "' + position + '" 无效');
    }

    if (duration) {
      if (waiting) {
        waitingTimeout && clearTimeout(waitingTimeout);
        waiting.close();
      }
      if (toast) {
        toastTimeout && clearTimeout(toastTimeout);
        plus.nativeUI.closeToast();
      }
      if (icon && !~['success', 'loading', 'none'].indexOf(icon)) {
        icon = 'success';
      }
      const waitingOptions = {
        modal: mask,
        back: 'transmit',
        padding: '10px',
        size: '16px' // 固定字体大小
      };
      if (!image && (!icon || icon === 'none')) { // 无图
        //       waitingOptions.width = '120px'
        //       waitingOptions.height = '40px'
        waitingOptions.loading = {
          display: 'none'
        };
      } else { // 有图
        waitingOptions.width = '140px';
        waitingOptions.height = '112px';
      }
      if (image) {
        waitingOptions.loading = {
          display: 'block',
          height: '55px',
          icon: image,
          interval: duration
        };
      } else {
        if (icon === 'success') {
          waitingOptions.loading = {
            display: 'block',
            height: '55px',
            icon: '__uniappsuccess.png',
            interval: duration

          };
        }
      }

      waiting = plus.nativeUI.showWaiting(title, waitingOptions);
      waitingTimeout = setTimeout(() => {
        hideToast();
      }, duration);
    }
    return {
      errMsg: 'showToast:ok'
    }
  }

  function hideToast () {
    if (toast) {
      toastTimeout && clearTimeout(toastTimeout);
      plus.nativeUI.closeToast();
      toast = false;
    }
    if (waiting) {
      waitingTimeout && clearTimeout(waitingTimeout);
      waiting.close();
      waiting = null;
      waitingTimeout = null;
    }
    return {
      errMsg: 'hideToast:ok'
    }
  }
  function showModal$1 ({
    title = '',
    content = '',
    showCancel = true,
    cancelText = '取消',
    cancelColor = '#000000',
    confirmText = '确定',
    confirmColor = '#3CC51F'
  } = {}, callbackId) {
    plus.nativeUI.confirm(content, (e) => {
      if (showCancel) {
        invoke(callbackId, {
          errMsg: 'showModal:ok',
          confirm: e.index === 1,
          cancel: e.index === 0 || e.index === -1
        });
      } else {
        invoke(callbackId, {
          errMsg: 'showModal:ok',
          confirm: e.index === 0,
          cancel: false
        });
      }
    }, title, showCancel ? [cancelText, confirmText] : [confirmText]);
  }
  function showActionSheet$1 ({
    itemList = [],
    itemColor = '#000000',
    title = ''
  }, callbackId) {
    const options = {
      buttons: itemList.map(item => ({
        title: item
      }))
    };
    if (title) {
      options.title = title;
    }

    if (plus.os.name === 'iOS') {
      options.cancel = '取消';
    }

    plus.nativeUI.actionSheet(options, (e) => {
      if (e.index > 0) {
        invoke(callbackId, {
          errMsg: 'showActionSheet:ok',
          tapIndex: e.index - 1
        });
      } else {
        invoke(callbackId, {
          errMsg: 'showActionSheet:fail cancel'
        });
      }
    });
  }

  function setTabBarBadge$2 ({
    index,
    text,
    type = 'text'
  }) {
    tabBar.setTabBarBadge(type, index, text);
    return {
      errMsg: 'setTabBarBadge:ok'
    }
  }

  function setTabBarItem$2 ({
    index,
    text,
    iconPath,
    selectedIconPath
  }) {
    if (!isTabBarPage()) {
      return {
        errMsg: 'setTabBarItem:fail not TabBar page'
      }
    }
    tabBar.setTabBarItem(index, text, iconPath, selectedIconPath);
    return {
      errMsg: 'setTabBarItem:ok'
    }
  }

  function setTabBarStyle$2 ({
    color,
    selectedColor,
    backgroundColor,
    borderStyle
  }) {
    if (!isTabBarPage()) {
      return {
        errMsg: 'setTabBarStyle:fail not TabBar page'
      }
    }
    tabBar.setTabBarStyle({
      color,
      selectedColor,
      backgroundColor,
      borderStyle
    });
    return {
      errMsg: 'setTabBarStyle:ok'
    }
  }

  function hideTabBar$2 ({
    animation
  }) {
    if (!isTabBarPage()) {
      return {
        errMsg: 'hideTabBar:fail not TabBar page'
      }
    }
    tabBar.hideTabBar(animation);
    return {
      errMsg: 'hideTabBar:ok'
    }
  }

  function showTabBar$2 ({
    animation
  }) {
    if (!isTabBarPage()) {
      return {
        errMsg: 'showTabBar:fail not TabBar page'
      }
    }
    tabBar.showTabBar(animation);
    return {
      errMsg: 'showTabBar:ok'
    }
  }



  var appApi = /*#__PURE__*/Object.freeze({
    startPullDownRefresh: startPullDownRefresh,
    stopPullDownRefresh: stopPullDownRefresh,
    chooseImage: chooseImage$1,
    createAudioInstance: createAudioInstance,
    destroyAudioInstance: destroyAudioInstance,
    setAudioState: setAudioState,
    getAudioState: getAudioState,
    operateAudio: operateAudio,
    enableAccelerometer: enableAccelerometer,
    addPhoneContact: addPhoneContact,
    openBluetoothAdapter: openBluetoothAdapter,
    closeBluetoothAdapter: closeBluetoothAdapter,
    getBluetoothAdapterState: getBluetoothAdapterState,
    startBluetoothDevicesDiscovery: startBluetoothDevicesDiscovery,
    stopBluetoothDevicesDiscovery: stopBluetoothDevicesDiscovery,
    getBluetoothDevices: getBluetoothDevices,
    getConnectedBluetoothDevices: getConnectedBluetoothDevices,
    createBLEConnection: createBLEConnection,
    closeBLEConnection: closeBLEConnection,
    getBLEDeviceServices: getBLEDeviceServices,
    getBLEDeviceCharacteristics: getBLEDeviceCharacteristics,
    notifyBLECharacteristicValueChange: notifyBLECharacteristicValueChange,
    notifyBLECharacteristicValueChanged: notifyBLECharacteristicValueChanged,
    readBLECharacteristicValue: readBLECharacteristicValue,
    writeBLECharacteristicValue: writeBLECharacteristicValue,
    getScreenBrightness: getScreenBrightness,
    setScreenBrightness: setScreenBrightness,
    setKeepScreenOn: setKeepScreenOn,
    getClipboardData: getClipboardData,
    setClipboardData: setClipboardData,
    enableCompass: enableCompass,
    getNetworkType: getNetworkType,
    onBeaconUpdate: onBeaconUpdate,
    onBeaconServiceChange: onBeaconServiceChange,
    getBeacons: getBeacons,
    startBeaconDiscovery: startBeaconDiscovery,
    stopBeaconDiscovery: stopBeaconDiscovery,
    makePhoneCall: makePhoneCall$1,
    SCAN_ID: SCAN_ID,
    SCAN_PATH: SCAN_PATH,
    scanCode: scanCode,
    getSystemInfoSync: getSystemInfoSync,
    getSystemInfo: getSystemInfo,
    vibrateLong: vibrateLong,
    vibrateShort: vibrateShort,
    saveFile: saveFile,
    getSavedFileList: getSavedFileList,
    getFileInfo: getFileInfo,
    getSavedFileInfo: getSavedFileInfo,
    removeSavedFile: removeSavedFile,
    openDocument: openDocument$1,
    chooseLocation: chooseLocation$1,
    getLocation: getLocation$1,
    openLocation: openLocation$1,
    startRecord: startRecord,
    stopRecord: stopRecord,
    playVoice: playVoice,
    pauseVoice: pauseVoice,
    stopVoice: stopVoice,
    getMusicPlayerState: getMusicPlayerState,
    operateMusicPlayer: operateMusicPlayer,
    setBackgroundAudioState: setBackgroundAudioState,
    operateBackgroundAudio: operateBackgroundAudio,
    getBackgroundAudioState: getBackgroundAudioState,
    chooseVideo: chooseVideo$1,
    compressImage: compressImage,
    getImageInfo: getImageInfo$1,
    previewImage: previewImage$1,
    operateRecorder: operateRecorder,
    saveImageToPhotosAlbum: saveImageToPhotosAlbum,
    saveVideoToPhotosAlbum: saveVideoToPhotosAlbum,
    operateDownloadTask: operateDownloadTask,
    createDownloadTask: createDownloadTask,
    createRequestTaskById: createRequestTaskById,
    createRequestTask: createRequestTask,
    operateRequestTask: operateRequestTask,
    createSocketTask: createSocketTask,
    operateSocketTask: operateSocketTask,
    operateUploadTask: operateUploadTask,
    createUploadTask: createUploadTask,
    getProvider: getProvider$1,
    login: login,
    getUserInfo: getUserInfo,
    operateWXData: operateWXData,
    requestPayment: requestPayment,
    subscribePush: subscribePush,
    unsubscribePush: unsubscribePush,
    onPush: onPush,
    offPush: offPush,
    shareAppMessageDirectly: shareAppMessageDirectly,
    share: share,
    showKeyboard: showKeyboard,
    hideKeyboard: hideKeyboard,
    setNavigationBarTitle: setNavigationBarTitle$1,
    showNavigationBarLoading: showNavigationBarLoading,
    hideNavigationBarLoading: hideNavigationBarLoading,
    setNavigationBarColor: setNavigationBarColor$1,
    showLoading: showLoading$1,
    hideLoading: hideLoading,
    showToast: showToast$1,
    hideToast: hideToast,
    showModal: showModal$1,
    showActionSheet: showActionSheet$1,
    setTabBarBadge: setTabBarBadge$2,
    setTabBarItem: setTabBarItem$2,
    setTabBarStyle: setTabBarStyle$2,
    hideTabBar: hideTabBar$2,
    showTabBar: showTabBar$2
  });

  const Emitter = new Vue();

  function apply (ctx, method, args) {
    return ctx[method].apply(ctx, args)
  }

  function $on$1 () {
    return apply(Emitter, '$on', [...arguments])
  }

  function $off$1 () {
    return apply(Emitter, '$off', [...arguments])
  }

  function $once$1 () {
    return apply(Emitter, '$once', [...arguments])
  }

  function $emit$1 () {
    return apply(Emitter, '$emit', [...arguments])
  }

  var eventApis = /*#__PURE__*/Object.freeze({
    $on: $on$1,
    $off: $off$1,
    $once: $once$1,
    $emit: $emit$1
  });

  var api = Object.assign(Object.create(null), appApi, eventApis);

  /**
   * 执行内部平台方法
   */
  function invokeMethod (name, ...args) {
    return api[name].apply(null, args)
  }
  /**
   * 监听 service 层内部平台方法回调，与 publish 对应
   * @param {Object} name
   * @param {Object} callback
   */
  function onMethod (name, callback) {
    return UniServiceJSBridge.on('api.' + name, callback)
  }

  const eventNames = [
    'canplay',
    'play',
    'pause',
    'stop',
    'ended',
    'timeupdate',
    'error',
    'waiting',
    'seeking',
    'seeked'
  ];

  const props = [
    {
      name: 'src',
      cache: true
    },
    {
      name: 'startTime',
      default: 0,
      cache: true
    },
    {
      name: 'autoplay',
      default: false,
      cache: true
    },
    {
      name: 'loop',
      default: false,
      cache: true
    },
    {
      name: 'obeyMuteSwitch',
      default: true,
      readonly: true,
      cache: true
    },
    {
      name: 'duration',
      readonly: true
    },
    {
      name: 'currentTime',
      readonly: true
    },
    {
      name: 'paused',
      readonly: true
    },
    {
      name: 'buffered',
      readonly: true
    },
    {
      name: 'volume'
    }
  ];

  class InnerAudioContext {
    constructor (id) {
      this.id = id;
      this._callbacks = {};
      this._options = {};
      eventNames.forEach(name => {
        this._callbacks[name] = [];
      });
      props.forEach(item => {
        const name = item.name;
        const data = {
          get () {
            const result = item.cache ? this._options : invokeMethod('getAudioState', {
              audioId: this.id
            });
            const value = name in result ? result[name] : item.default;
            return typeof value === 'number' && name !== 'volume' ? value / 1e3 : value
          }
        };
        if (!item.readonly) {
          data.set = function (value) {
            this._options[name] = value;
            invokeMethod('setAudioState', Object.assign({}, this._options, {
              audioId: this.id
            }));
          };
        }
        Object.defineProperty(this, name, data);
      });
    }
    play () {
      this._operate('play');
    }
    pause () {
      this._operate('pause');
    }
    stop () {
      this._operate('stop');
    }
    seek (position) {
      this._operate('play', {
        currentTime: position
      });
    }
    destroy () {
      invokeMethod('destroyAudioInstance', {
        audioId: this.id
      });
      delete innerAudioContexts[this.id];
    }
    _operate (type, options) {
      invokeMethod('operateAudio', Object.assign({}, options, {
        audioId: this.id,
        operationType: type
      }));
    }
  }

  eventNames.forEach(item => {
    const name = item[0].toUpperCase() + item.substr(1);
    InnerAudioContext.prototype[`on${name}`] = function (callback) {
      this._callbacks[item].push(callback);
    };
    InnerAudioContext.prototype[`off${name}`] = function (callback) {
      const callbacks = this._callbacks[item];
      const index = callbacks.indexOf(callback);
      if (index >= 0) {
        callbacks.splice(index, 1);
      }
    };
  });

  onMethod('onAudioStateChange', ({
    state,
    audioId,
    errMsg,
    errCode
  }) => {
    const audio = innerAudioContexts[audioId];
    audio && audio._callbacks[state].forEach(callback => {
      if (typeof callback === 'function') {
        callback(state === 'error' ? {
          errMsg,
          errCode
        } : {});
      }
    });
  });

  const innerAudioContexts = Object.create(null);

  function createInnerAudioContext () {
    const {
      audioId
    } = invokeMethod('createAudioInstance');
    const innerAudioContext = new InnerAudioContext(audioId);
    innerAudioContexts[audioId] = innerAudioContext;
    return innerAudioContext
  }

  var require_context_module_1_4 = /*#__PURE__*/Object.freeze({
    createInnerAudioContext: createInnerAudioContext
  });

  const eventNames$1 = [
    'canplay',
    'play',
    'pause',
    'stop',
    'ended',
    'timeupdate',
    'prev',
    'next',
    'error',
    'waiting'
  ];
  const callbacks$1 = {};
  eventNames$1.forEach(name => {
    callbacks$1[name] = [];
  });

  const props$1 = [
    {
      name: 'duration',
      readonly: true
    },
    {
      name: 'currentTime',
      readonly: true
    },
    {
      name: 'paused',
      readonly: true
    },
    {
      name: 'src',
      cache: true
    },
    {
      name: 'startTime',
      default: 0,
      cache: true
    },
    {
      name: 'buffered',
      readonly: true
    },
    {
      name: 'title',
      cache: true
    },
    {
      name: 'epname',
      cache: true
    },
    {
      name: 'singer',
      cache: true
    },
    {
      name: 'coverImgUrl',
      cache: true
    },
    {
      name: 'webUrl',
      cache: true
    },
    {
      name: 'protocol',
      readonly: true,
      default: 'http'
    }
  ];

  class BackgroundAudioManager {
    constructor () {
      this._options = {};
      onMethod('onBackgroundAudioStateChange', ({
        state,
        errMsg,
        errCode
      }) => {
        callbacks$1[state].forEach(callback => {
          if (typeof callback === 'function') {
            callback(state === 'error' ? {
              errMsg,
              errCode
            } : {});
          }
        });
      });
      props$1.forEach(item => {
        const name = item.name;
        const data = {
          get () {
            const result = item.cache ? this._options : invokeMethod('getBackgroundAudioState');
            return name in result ? result[name] : item.default
          }
        };
        if (!item.readonly) {
          data.set = function (value) {
            this._options[name] = value;
            invokeMethod('setBackgroundAudioState', Object.assign({}, this._options, {
              audioId: this.id
            }));
          };
        }
        Object.defineProperty(this, name, data);
      });
    }
    play () {
      this._operate('play');
    }
    pause () {
      this._operate('pause');
    }
    stop () {
      this._operate('stop');
    }
    seek (position) {
      this._operate('play', {
        currentTime: position
      });
    }
    _operate (type, options) {
      invokeMethod('operateBackgroundAudio', Object.assign({}, options, {
        operationType: type
      }));
    }
  }

  eventNames$1.forEach(item => {
    const name = item[0].toUpperCase() + item.substr(1);
    BackgroundAudioManager.prototype[`on${name}`] = function (callback) {
      callbacks$1[item].push(callback);
    };
  });

  let backgroundAudioManager;

  function getBackgroundAudioManager () {
    return backgroundAudioManager || (backgroundAudioManager = new BackgroundAudioManager())
  }

  var require_context_module_1_5 = /*#__PURE__*/Object.freeze({
    getBackgroundAudioManager: getBackgroundAudioManager
  });

  const callbacks$2 = [];

  onMethod('onAccelerometerChange', function (res) {
    callbacks$2.forEach(callbackId => {
      invoke(callbackId, res);
    });
  });

  let isEnable = false;
  /**
   * 监听加速度
   * @param {*} callbackId
   */
  function onAccelerometerChange (callbackId) {
    // TODO 当没有 start 时，添加 on 需要主动 start?
    callbacks$2.push(callbackId);
    if (!isEnable) {
      startAccelerometer();
    }
  }

  function startAccelerometer ({
    interval // TODO
  } = {}) {
    if (isEnable) {
      return
    }
    isEnable = true;
    return invokeMethod('enableAccelerometer', {
      enable: true
    })
  }

  function stopAccelerometer () {
    isEnable = false;
    return invokeMethod('enableAccelerometer', {
      enable: false
    })
  }

  var require_context_module_1_6 = /*#__PURE__*/Object.freeze({
    onAccelerometerChange: onAccelerometerChange,
    startAccelerometer: startAccelerometer,
    stopAccelerometer: stopAccelerometer
  });

  function on (method) {
    const callbacks = [];
    onMethod(method, data => {
      callbacks.forEach(callbackId => {
        invoke(callbackId, data);
      });
    });
    return function (callbackId) {
      callbacks.push(callbackId);
    }
  }

  const onBluetoothDeviceFound$1 = on('onBluetoothDeviceFound');
  const onBluetoothAdapterStateChange$1 = on('onBluetoothAdapterStateChange');
  const onBLEConnectionStateChange$1 = on('onBLEConnectionStateChange');
  const onBLECharacteristicValueChange$1 = on('onBLECharacteristicValueChange');

  var require_context_module_1_7 = /*#__PURE__*/Object.freeze({
    onBluetoothDeviceFound: onBluetoothDeviceFound$1,
    onBluetoothAdapterStateChange: onBluetoothAdapterStateChange$1,
    onBLEConnectionStateChange: onBLEConnectionStateChange$1,
    onBLECharacteristicValueChange: onBLECharacteristicValueChange$1
  });

  const callbacks$3 = [];

  onMethod('onCompassChange', function (res) {
    callbacks$3.forEach(callbackId => {
      invoke(callbackId, res);
    });
  });

  let isEnable$1 = false;
  /**
   * 监听加速度
   * @param {*} callbackId
   */
  function onCompassChange (callbackId) {
    // TODO 当没有 start 时，添加 on 需要主动 start?
    callbacks$3.push(callbackId);
    if (!isEnable$1) {
      startCompass();
    }
  }

  function startCompass ({
    interval // TODO
  } = {}) {
    if (isEnable$1) {
      return
    }
    isEnable$1 = true;
    return invokeMethod('enableCompass', {
      enable: true
    })
  }

  function stopCompass () {
    isEnable$1 = false;
    return invokeMethod('enableCompass', {
      enable: false
    })
  }

  var require_context_module_1_8 = /*#__PURE__*/Object.freeze({
    onCompassChange: onCompassChange,
    startCompass: startCompass,
    stopCompass: stopCompass
  });

  const callbacks$4 = [];

  onMethod('onNetworkStatusChange', res => {
    callbacks$4.forEach(callbackId => {
      invoke(callbackId, res);
    });
  });

  function onNetworkStatusChange (callbackId) {
    callbacks$4.push(callbackId);
  }

  var require_context_module_1_9 = /*#__PURE__*/Object.freeze({
    onNetworkStatusChange: onNetworkStatusChange
  });

  const callbacks$5 = {
    pause: [],
    resume: [],
    start: [],
    stop: []
  };

  class RecorderManager {
    constructor () {
      onMethod('onRecorderStateChange', res => {
        const state = res.state;
        delete res.state;
        delete res.errMsg;
        callbacks$5[state].forEach(callback => {
          if (typeof callback === 'function') {
            callback(res);
          }
        });
      });
    }
    onError (callback) {
      callbacks$5.error.push(callback);
    }
    onFrameRecorded (callback) {

    }
    onInterruptionBegin (callback) {

    }
    onInterruptionEnd (callback) {

    }
    onPause (callback) {
      callbacks$5.pause.push(callback);
    }
    onResume (callback) {
      callbacks$5.resume.push(callback);
    }
    onStart (callback) {
      callbacks$5.start.push(callback);
    }
    onStop (callback) {
      callbacks$5.stop.push(callback);
    }
    pause () {
      invokeMethod('operateRecorder', {
        operationType: 'pause'
      });
    }
    resume () {
      invokeMethod('operateRecorder', {
        operationType: 'resume'
      });
    }
    start (options) {
      invokeMethod('operateRecorder', Object.assign({}, options, {
        operationType: 'start'
      }));
    }
    stop () {
      invokeMethod('operateRecorder', {
        operationType: 'stop'
      });
    }
  }

  let recorderManager;

  function getRecorderManager () {
    return recorderManager || (recorderManager = new RecorderManager())
  }

  var require_context_module_1_10 = /*#__PURE__*/Object.freeze({
    getRecorderManager: getRecorderManager
  });

  class DownloadTask {
    constructor (downloadTaskId, callbackId) {
      this.id = downloadTaskId;
      this._callbackId = callbackId;
      this._callbacks = [];
    }
    abort () {
      invokeMethod('operateRequestTask', {
        downloadTaskId: this.id,
        operationType: 'abort'
      });
    }
    onProgressUpdate (callback) {
      if (typeof callback !== 'function') {
        return
      }
      this._callbacks.push(callback);
    }
    onHeadersReceived () {

    }
    offProgressUpdate (callback) {
      const index = this._callbacks.indexOf(callback);
      if (index >= 0) {
        this._callbacks.splice(index, 1);
      }
    }
    offHeadersReceived () {

    }
  }
  const downloadTasks$1 = Object.create(null);
  onMethod('onDownloadTaskStateChange', ({
    downloadTaskId,
    state,
    tempFilePath,
    statusCode,
    progress,
    totalBytesWritten,
    totalBytesExpectedToWrite,
    errMsg
  }) => {
    const downloadTask = downloadTasks$1[downloadTaskId];
    const callbackId = downloadTask._callbackId;

    switch (state) {
      case 'progressUpdate':
        downloadTask._callbacks.forEach(callback => {
          callback({
            progress,
            totalBytesWritten,
            totalBytesExpectedToWrite
          });
        });
        break
      case 'success':
        invoke(callbackId, {
          tempFilePath,
          statusCode,
          errMsg: 'request:ok'
        });
        // eslint-disable-next-line no-fallthrough
      case 'fail':
        invoke(callbackId, {
          errMsg: 'request:fail ' + errMsg
        });
        // eslint-disable-next-line no-fallthrough
      default:
        // progressUpdate 可能晚于 success
        setTimeout(() => {
          delete downloadTasks$1[downloadTaskId];
        }, 100);
        break
    }
  });
  function downloadFile$1 (args, callbackId) {
    const {
      downloadTaskId
    } = invokeMethod('createDownloadTask', args);
    const task = new DownloadTask(downloadTaskId, callbackId);
    downloadTasks$1[downloadTaskId] = task;
    return task
  }

  var require_context_module_1_11 = /*#__PURE__*/Object.freeze({
    downloadFile: downloadFile$1
  });

  const requestTasks$1 = Object.create(null);

  function formatResponse (res, args) {
    if (
      typeof res.data === 'string' &&
      res.data.charCodeAt(0) === 65279
    ) {
      res.data = res.data.substr(1);
    }

    res.statusCode = parseInt(res.statusCode, 10);

    if (isPlainObject(res.header)) {
      res.header = Object.keys(res.header).reduce(function (ret, key) {
        const value = res.header[key];
        if (Array.isArray(value)) {
          ret[key] = value.join(',');
        } else if (typeof value === 'string') {
          ret[key] = value;
        }
        return ret
      }, {});
    }

    if (args.dataType && args.dataType.toLowerCase() === 'json') {
      try {
        res.data = JSON.parse(res.data);
      } catch (e) {}
    }

    return res
  }

  onMethod('onRequestTaskStateChange', function ({
    requestTaskId,
    state,
    data,
    statusCode,
    header,
    errMsg
  }) {
    const {
      args,
      callbackId
    } = requestTasks$1[requestTaskId] || {};

    if (!callbackId) {
      return
    }
    delete requestTasks$1[requestTaskId];
    switch (state) {
      case 'success':
        invoke(callbackId, formatResponse({
          data,
          statusCode,
          header,
          errMsg: 'request:ok'
        }, args));
        break
      case 'fail':
        invoke(callbackId, {
          errMsg: 'request:fail ' + errMsg
        });
        break
    }
  });

  class RequestTask {
    constructor (id) {
      this.id = id;
    }

    abort () {
      invokeMethod('operateRequestTask', {
        requestTaskId: this.id,
        operationType: 'abort'
      });
    }

    offHeadersReceived () {

    }

    onHeadersReceived () {

    }
  }

  function request$1 (args, callbackId) {
    const {
      requestTaskId
    } = invokeMethod('createRequestTask', args);

    requestTasks$1[requestTaskId] = {
      args,
      callbackId
    };

    return new RequestTask(requestTaskId)
  }

  var require_context_module_1_12 = /*#__PURE__*/Object.freeze({
    request: request$1
  });

  class SocketTask {
    constructor (socketTaskId) {
      this.id = socketTaskId;
      this._callbacks = {
        open: [],
        close: [],
        error: [],
        message: []
      };
      this.CLOSED = 3;
      this.CLOSING = 2;
      this.CONNECTING = 0;
      this.OPEN = 1;
      this.readyState = this.CLOSED;
    }
    send (args) {
      if (this.readyState !== this.OPEN) {
        this._callback(args, 'sendSocketMessage:fail WebSocket is not connected');
      }
      const {
        errMsg
      } = invokeMethod('operateSocketTask', Object.assign({}, args, {
        operationType: 'send',
        socketTaskId: this.id
      }));
      this._callback(args, errMsg.replace('operateSocketTask', 'sendSocketMessage'));
    }
    close (args) {
      this.readyState = this.CLOSING;
      const {
        errMsg
      } = invokeMethod('operateSocketTask', Object.assign({}, args, {
        operationType: 'close',
        socketTaskId: this.id
      }));
      this._callback(args, errMsg.replace('operateSocketTask', 'closeSocket'));
    }
    onOpen (callback) {
      this._callbacks.open.push(callback);
    }
    onClose (callback) {
      this._callbacks.close.push(callback);
    }
    onError (callback) {
      this._callbacks.error.push(callback);
    }
    onMessage (callback) {
      this._callbacks.message.push(callback);
    }
    _callback ({
      success,
      fail,
      complete
    }, errMsg) {
      var data = {
        errMsg
      };
      if (/:ok$/.test(errMsg)) {
        if (typeof success === 'function') {
          success(data);
        }
      } else {
        if (typeof fail === 'function') {
          fail(data);
        }
      }
      if (typeof complete === 'function') {
        complete(data);
      }
    }
  }

  const socketTasks$1 = Object.create(null);
  const socketTasksArray = [];
  const callbacks$6 = Object.create(null);
  onMethod('onSocketTaskStateChange', ({
    socketTaskId,
    state,
    data,
    errMsg
  }) => {
    const socketTask = socketTasks$1[socketTaskId];
    if (!socketTask) {
      return
    }
    socketTask._callbacks[state].forEach(callback => {
      if (typeof callback === 'function') {
        callback(state === 'message' ? {
          data
        } : {});
      }
    });
    if (state === 'open') {
      socketTask.readyState = socketTask.OPEN;
    }
    if (socketTask === socketTasksArray[0] && callbacks$6[state]) {
      invoke(callbacks$6[state], state === 'message' ? {
        data
      } : {});
    }
    if (state === 'error' || state === 'close') {
      socketTask.readyState = socketTask.CLOSED;
      delete socketTasks$1[socketTaskId];
      const index = socketTasksArray.indexOf(socketTask);
      if (index >= 0) {
        socketTasksArray.splice(index, 1);
      }
    }
  });

  function connectSocket$1 (args, callbackId) {
    const {
      socketTaskId
    } = invokeMethod('createSocketTask', args);
    const task = new SocketTask(socketTaskId);
    socketTasks$1[socketTaskId] = task;
    socketTasksArray.push(task);
    setTimeout(() => {
      invoke(callbackId, {
        errMsg: 'connectSocket:ok'
      });
    }, 0);
    return task
  }

  function sendSocketMessage$1 (args, callbackId) {
    const socketTask = socketTasksArray[0];
    if (!socketTask || socketTask.readyState !== socketTask.OPEN) {
      invoke(callbackId, {
        errMsg: 'sendSocketMessage:fail WebSocket is not connected'
      });
      return
    }
    return invokeMethod('operateSocketTask', Object.assign({}, args, {
      operationType: 'send',
      socketTaskId: socketTask.id
    }))
  }

  function closeSocket$1 (args, callbackId) {
    const socketTask = socketTasksArray[0];
    if (!socketTask) {
      invoke(callbackId, {
        errMsg: 'closeSocket:fail WebSocket is not connected'
      });
      return
    }
    socketTask.readyState = socketTask.CLOSING;
    return invokeMethod('operateSocketTask', Object.assign({}, args, {
      operationType: 'close',
      socketTaskId: socketTask.id
    }))
  }

  function onSocketOpen (callbackId) {
    callbacks$6.open = callbackId;
  }

  function onSocketError (callbackId) {
    callbacks$6.error = callbackId;
  }

  function onSocketMessage (callbackId) {
    callbacks$6.message = callbackId;
  }

  function onSocketClose (callbackId) {
    callbacks$6.close = callbackId;
  }

  var require_context_module_1_13 = /*#__PURE__*/Object.freeze({
    connectSocket: connectSocket$1,
    sendSocketMessage: sendSocketMessage$1,
    closeSocket: closeSocket$1,
    onSocketOpen: onSocketOpen,
    onSocketError: onSocketError,
    onSocketMessage: onSocketMessage,
    onSocketClose: onSocketClose
  });

  class UploadTask {
    constructor (uploadTaskId, callbackId) {
      this.id = uploadTaskId;
      this._callbackId = callbackId;
      this._callbacks = [];
    }
    abort () {
      invokeMethod('operateRequestTask', {
        uploadTaskId: this.id,
        operationType: 'abort'
      });
    }
    onProgressUpdate (callback) {
      if (typeof callback !== 'function') {
        return
      }
      this._callbacks.push(callback);
    }
    onHeadersReceived () {

    }
    offProgressUpdate (callback) {
      const index = this._callbacks.indexOf(callback);
      if (index >= 0) {
        this._callbacks.splice(index, 1);
      }
    }
    offHeadersReceived () {

    }
  }
  const uploadTasks$1 = Object.create(null);
  onMethod('onUploadTaskStateChange', ({
    uploadTaskId,
    state,
    data,
    statusCode,
    progress,
    totalBytesSent,
    totalBytesExpectedToSend,
    errMsg
  }) => {
    const uploadTask = uploadTasks$1[uploadTaskId];
    const callbackId = uploadTask._callbackId;

    switch (state) {
      case 'progressUpdate':
        uploadTask._callbacks.forEach(callback => {
          callback({
            progress,
            totalBytesSent,
            totalBytesExpectedToSend
          });
        });
        break
      case 'success':
        invoke(callbackId, {
          data,
          statusCode,
          errMsg: 'request:ok'
        });
        // eslint-disable-next-line no-fallthrough
      case 'fail':
        invoke(callbackId, {
          errMsg: 'request:fail ' + errMsg
        });
        // eslint-disable-next-line no-fallthrough
      default:
        // progressUpdate 可能晚于 success
        setTimeout(() => {
          delete uploadTasks$1[uploadTaskId];
        }, 100);
        break
    }
  });
  function uploadFile$1 (args, callbackId) {
    const {
      uploadTaskId
    } = invokeMethod('createUploadTask', args);
    const task = new UploadTask(uploadTaskId, callbackId);
    uploadTasks$1[uploadTaskId] = task;
    return task
  }

  var require_context_module_1_14 = /*#__PURE__*/Object.freeze({
    uploadFile: uploadFile$1
  });

  function setStorage$1 ({
    key,
    data
  } = {}) {
    const value = {
      type: typeof data === 'object' ? 'object' : 'string',
      data: data
    };
    localStorage.setItem(key, JSON.stringify(value));
    const keyList = localStorage.getItem('uni-storage-keys');
    if (!keyList) {
      localStorage.setItem('uni-storage-keys', JSON.stringify([key]));
    } else {
      const keys = JSON.parse(keyList);
      if (keys.indexOf(key) < 0) {
        keys.push(key);
        localStorage.setItem('uni-storage-keys', JSON.stringify(keys));
      }
    }
    return {
      errMsg: 'setStorage:ok'
    }
  }

  function setStorageSync$1 (key, data) {
    setStorage$1({
      key,
      data
    });
  }

  function getStorage$1 ({
    key
  } = {}) {
    const data = localStorage.getItem(key);
    return data ? {
      data: JSON.parse(data).data,
      errMsg: 'getStorage:ok'
    } : {
      data: '',
      errMsg: 'getStorage:fail'
    }
  }

  function getStorageSync$1 (key) {
    const res = getStorage$1({
      key
    });
    return res.data
  }

  function removeStorage$1 ({
    key
  } = {}) {
    const keyList = localStorage.getItem('uni-storage-keys');
    if (keyList) {
      const keys = JSON.parse(keyList);
      const index = keys.indexOf(key);
      keys.splice(index, 1);
      localStorage.setItem('uni-storage-keys', JSON.stringify(keys));
    }
    localStorage.removeItem(key);
    return {
      errMsg: 'removeStorage:ok'
    }
  }

  function removeStorageSync$1 (key) {
    removeStorage$1({
      key
    });
  }

  function clearStorage () {
    localStorage.clear();
    return {
      errMsg: 'clearStorage:ok'
    }
  }

  function clearStorageSync () {
    clearStorage();
  }

  function getStorageInfo () { // TODO 暂时先不做大小的转换
    const keyList = localStorage.getItem('uni-storage-keys');
    return keyList ? {
      keys: JSON.parse(keyList),
      currentSize: 0,
      limitSize: 0,
      errMsg: 'getStorageInfo:ok'
    } : {
      keys: '',
      currentSize: 0,
      limitSize: 0,
      errMsg: 'getStorageInfo:fail'
    }
  }

  function getStorageInfoSync () {
    const res = getStorageInfo();
    delete res.errMsg;
    return res
  }

  var require_context_module_1_15 = /*#__PURE__*/Object.freeze({
    setStorage: setStorage$1,
    setStorageSync: setStorageSync$1,
    getStorage: getStorage$1,
    getStorageSync: getStorageSync$1,
    removeStorage: removeStorage$1,
    removeStorageSync: removeStorageSync$1,
    clearStorage: clearStorage,
    clearStorageSync: clearStorageSync,
    getStorageInfo: getStorageInfo,
    getStorageInfoSync: getStorageInfoSync
  });

  const defaultOption = {
    duration: 400,
    timingFunction: 'linear',
    delay: 0,
    transformOrigin: '50% 50% 0'
  };

  class MPAnimation {
    constructor (option) {
      this.actions = [];
      this.currentTransform = {};
      this.currentStepAnimates = [];
      this.option = Object.assign({}, defaultOption, option);
    }
    _getOption (option) {
      let _option = {
        transition: Object.assign({}, this.option, option)
      };
      _option.transformOrigin = _option.transition.transformOrigin;
      delete _option.transition.transformOrigin;
      return _option
    }
    _pushAnimates (type, args) {
      this.currentStepAnimates.push({
        type: type,
        args: args
      });
    }
    _converType (type) {
      return type.replace(/[A-Z]/g, text => {
        return `-${text.toLowerCase()}`
      })
    }
    _getValue (value) {
      return typeof value === 'number' ? `${value}px` : value
    }
    export () {
      const actions = this.actions;
      this.actions = [];
      return {
        actions
      }
    }
    step (option) {
      this.currentStepAnimates.forEach(animate => {
        if (animate.type !== 'style') {
          this.currentTransform[animate.type] = animate;
        } else {
          this.currentTransform[`${animate.type}.${animate.args[0]}`] = animate;
        }
      });
      this.actions.push({
        animates: Object.values(this.currentTransform),
        option: this._getOption(option)
      });
      this.currentStepAnimates = [];
      return this
    }
  }

  const animateTypes1 = ['matrix', 'matrix3d', 'rotate', 'rotate3d', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scale3d', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'translate', 'translate3d', 'translateX', 'translateY', 'translateZ'];
  const animateTypes2 = ['opacity', 'backgroundColor'];
  const animateTypes3 = ['width', 'height', 'left', 'right', 'top', 'bottom'];
  animateTypes1.concat(animateTypes2, animateTypes3).forEach(type => {
    MPAnimation.prototype[type] = function (...args) {
      if (animateTypes2.concat(animateTypes3).includes(type)) {
        this._pushAnimates('style', [this._converType(type), animateTypes3.includes(type) ? this._getValue(args[0]) : args[0]]);
      } else {
        this._pushAnimates(type, args);
      }
      return this
    };
  });

  function createAnimation (option) {
    return new MPAnimation(option)
  }

  var require_context_module_1_16 = /*#__PURE__*/Object.freeze({
    createAnimation: createAnimation
  });

  const callbacks$7 = [];

  onMethod('onKeyboardHeightChange', res => {
    callbacks$7.forEach(callbackId => {
      invoke(callbackId, res);
    });
  });

  function onKeyboardHeightChange (callbackId) {
    callbacks$7.push(callbackId);
  }

  var require_context_module_1_17 = /*#__PURE__*/Object.freeze({
    onKeyboardHeightChange: onKeyboardHeightChange
  });

  function pageScrollTo$1 (args) {
    const pages = getCurrentPages();
    if (pages.length) {
      UniServiceJSBridge.publishHandler('pageScrollTo', args, pages[pages.length - 1].$page.id);
    }
    return {}
  }

  var require_context_module_1_18 = /*#__PURE__*/Object.freeze({
    pageScrollTo: pageScrollTo$1
  });

  function removeTabBarBadge$1 ({
    index
  }) {
    return invokeMethod('setTabBarBadge', {
      index,
      type: 'none'
    })
  }

  function showTabBarRedDot$1 ({
    index
  }) {
    return invokeMethod('setTabBarBadge', {
      index,
      type: 'redDot'
    })
  }

  const hideTabBarRedDot$1 = removeTabBarBadge$1;

  var require_context_module_1_19 = /*#__PURE__*/Object.freeze({
    removeTabBarBadge: removeTabBarBadge$1,
    showTabBarRedDot: showTabBarRedDot$1,
    hideTabBarRedDot: hideTabBarRedDot$1
  });

  const callbacks$8 = [];
  onMethod('onViewDidResize', res => {
    callbacks$8.forEach(callbackId => {
      invoke(callbackId, res);
    });
  });

  function onWindowResize (callbackId) {
    callbacks$8.push(callbackId);
  }

  function offWindowResize (callbackId) {
    // 此处和微信平台一致查询不到去掉最后一个
    callbacks$8.splice(callbacks$8.indexOf(callbackId), 1);
  }

  var require_context_module_1_20 = /*#__PURE__*/Object.freeze({
    onWindowResize: onWindowResize,
    offWindowResize: offWindowResize
  });

  const api$1 = Object.create(null);

  const modules$1 = 
    (function() {
      var map = {
        './base/base64.js': require_context_module_1_0,
  './base/can-i-use.js': require_context_module_1_1,
  './base/interceptor.js': require_context_module_1_2,
  './base/upx2px.js': require_context_module_1_3,
  './context/audio.js': require_context_module_1_4,
  './context/background-audio.js': require_context_module_1_5,
  './device/accelerometer.js': require_context_module_1_6,
  './device/bluetooth.js': require_context_module_1_7,
  './device/compass.js': require_context_module_1_8,
  './device/network.js': require_context_module_1_9,
  './media/recorder.js': require_context_module_1_10,
  './network/download-file.js': require_context_module_1_11,
  './network/request.js': require_context_module_1_12,
  './network/socket.js': require_context_module_1_13,
  './network/upload-file.js': require_context_module_1_14,
  './storage/storage.js': require_context_module_1_15,
  './ui/create-animation.js': require_context_module_1_16,
  './ui/keyboard.js': require_context_module_1_17,
  './ui/page-scroll-to.js': require_context_module_1_18,
  './ui/tab-bar.js': require_context_module_1_19,
  './ui/window.js': require_context_module_1_20,

      };
      var req = function req(key) {
        return map[key] || (function() { throw new Error("Cannot find module '" + key + "'.") }());
      };
      req.keys = function() {
        return Object.keys(map);
      };
      return req;
    })();


  modules$1.keys().forEach(function (key) {
    Object.assign(api$1, modules$1(key));
  });

  const SUCCESS = 'success';
  const FAIL = 'fail';
  const COMPLETE = 'complete';
  const CALLBACKS = [SUCCESS, FAIL, COMPLETE];

  /**
   * 调用无参数，或仅一个参数且为 callback 的 API
   * @param {Object} vm
   * @param {Object} method
   * @param {Object} args
   * @param {Object} extras
   */
  function invokeVmMethodWithoutArgs (vm, method, args, extras) {
    if (!vm) {
      return
    }
    if (typeof args === 'undefined') {
      return vm[method]()
    }
    const [, callbacks] = normalizeArgs(args, extras);
    if (!Object.keys(callbacks).length) {
      return vm[method]()
    }
    return vm[method](normalizeCallback(method, callbacks))
  }
  /**
   * 调用两个参数（第一个入参为普通参数，第二个入参为 callback） API
   * @param {Object} vm
   * @param {Object} method
   * @param {Object} args
   * @param {Object} extras
   */
  function invokeVmMethod (vm, method, args, extras) {
    if (!vm) {
      return
    }
    const [pureArgs, callbacks] = normalizeArgs(args, extras);
    if (!Object.keys(callbacks).length) {
      return vm[method](pureArgs)
    }
    return vm[method](pureArgs, normalizeCallback(method, callbacks))
  }

  function findElmById (id, vm) {
    return findRefByElm(id, vm.$el)
  }

  function findRefByElm (id, elm) {
    if (!id || !elm) {
      return
    }
    if (elm.attr.id === id) {
      return elm
    }
    const children = elm.children;
    if (!children) {
      return
    }
    for (let i = 0, len = children.length; i < len; i++) {
      const elm = findRefByElm(id, children[i]);
      if (elm) {
        return elm
      }
    }
  }

  function normalizeArgs (args = {}, extras) {
    const callbacks = Object.create(null);

    const iterator = function iterator (name) {
      const callback = args[name];
      if (isFn(callback)) {
        callbacks[name] = callback;
        delete args[name];
      }
    };

    CALLBACKS.forEach(iterator);

    extras && extras.forEach(iterator);

    return [args, callbacks]
  }

  function normalizeCallback (method, callbacks) {
    return function weexCallback (ret) {
      const type = ret.type;
      delete ret.type;
      const callback = callbacks[type];

      if (type === SUCCESS) {
        ret.errMsg = `${method}:ok`;
      } else if (type === FAIL) {
        ret.errMsg = method + ':fail' + (ret.msg ? (' ' + ret.msg) : '');
      }

      delete ret.code;
      delete ret.msg;

      isFn(callback) && callback(ret);

      if (type === SUCCESS || type === FAIL) {
        const complete = callbacks['complete'];
        isFn(complete) && complete(ret);
      }
    }
  }

  class LivePusherContext {
    constructor (id, ctx) {
      this.id = id;
      this.ctx = ctx;
    }

    start (cbs) {
      return invokeVmMethodWithoutArgs(this.ctx, 'start', cbs)
    }

    stop (cbs) {
      return invokeVmMethodWithoutArgs(this.ctx, 'stop', cbs)
    }

    pause (cbs) {
      return invokeVmMethodWithoutArgs(this.ctx, 'pause', cbs)
    }

    resume (cbs) {
      return invokeVmMethodWithoutArgs(this.ctx, 'resume', cbs)
    }

    switchCamera (cbs) {
      return invokeVmMethodWithoutArgs(this.ctx, 'switchCamera', cbs)
    }

    snapshot (cbs) {
      return invokeVmMethodWithoutArgs(this.ctx, 'snapshot', cbs)
    }

    toggleTorch (cbs) {
      return invokeVmMethodWithoutArgs(this.ctx, 'toggleTorch', cbs)
    }

    playBGM (args) {
      return invokeVmMethod(this.ctx, 'playBGM', args)
    }

    stopBGM (cbs) {
      return invokeVmMethodWithoutArgs(this.ctx, 'stopBGM', cbs)
    }

    pauseBGM (cbs) {
      return invokeVmMethodWithoutArgs(this.ctx, 'pauseBGM', cbs)
    }

    resumeBGM (cbs) {
      return invokeVmMethodWithoutArgs(this.ctx, 'resumeBGM', cbs)
    }

    setBGMVolume (cbs) {
      return invokeVmMethod(this.ctx, 'setBGMVolume', cbs)
    }

    startPreview (cbs) {
      return invokeVmMethodWithoutArgs(this.ctx, 'startPreview', cbs)
    }

    stopPreview (args) {
      return invokeVmMethodWithoutArgs(this.ctx, 'stopPreview', args)
    }
  }

  function createLivePusherContext (id, vm) {
    if (!vm) {
      return console.warn('uni.createLivePusherContext 必须传入第二个参数，即当前 vm 对象(this)')
    }
    const elm = findElmById(id, vm);
    if (!elm) {
      return console.warn('Can not find `' + id + '`')
    }
    return new LivePusherContext(id, elm)
  }

  class MapContext {
    constructor (id, ctx) {
      this.id = id;
      this.ctx = ctx;
    }

    getCenterLocation (cbs) {
      return invokeVmMethodWithoutArgs(this.ctx, 'getCenterLocation', cbs)
    }

    moveToLocation () {
      return invokeVmMethodWithoutArgs(this.ctx, 'moveToLocation')
    }

    translateMarker (args) {
      return invokeVmMethod(this.ctx, 'translateMarker', args, ['animationEnd'])
    }

    includePoints (args) {
      return invokeVmMethod(this.ctx, 'includePoints', args)
    }

    getRegion (cbs) {
      return invokeVmMethodWithoutArgs(this.ctx, 'getRegion', cbs)
    }

    getScale (cbs) {
      return invokeVmMethodWithoutArgs(this.ctx, 'getScale', cbs)
    }
  }

  function createMapContext$1 (id, vm) {
    if (!vm) {
      return console.warn('uni.createMapContext 必须传入第二个参数，即当前 vm 对象(this)')
    }
    const elm = findElmById(id, vm);
    if (!elm) {
      return console.warn('Can not find `' + id + '`')
    }
    return new MapContext(id, elm)
  }

  class VideoContext {
    constructor (id, ctx) {
      this.id = id;
      this.ctx = ctx;
    }

    play () {
      return invokeVmMethodWithoutArgs(this.ctx, 'play')
    }

    pause () {
      return invokeVmMethodWithoutArgs(this.ctx, 'pause')
    }

    seek (args) {
      return invokeVmMethod(this.ctx, 'seek', args)
    }

    stop () {
      return invokeVmMethodWithoutArgs(this.ctx, 'stop')
    }

    sendDanmu (args) {
      return invokeVmMethod(this.ctx, 'sendDanmu', args)
    }

    playbackRate (args) {
      return invokeVmMethod(this.ctx, 'playbackRate', args)
    }

    requestFullScreen (args) {
      return invokeVmMethod(this.ctx, 'requestFullScreen', args)
    }

    exitFullScreen () {
      return invokeVmMethodWithoutArgs(this.ctx, 'exitFullScreen')
    }

    showStatusBar () {
      return invokeVmMethodWithoutArgs(this.ctx, 'showStatusBar')
    }

    hideStatusBar () {
      return invokeVmMethodWithoutArgs(this.ctx, 'hideStatusBar')
    }
  }

  function createVideoContext$1 (id, vm) {
    if (!vm) {
      return console.warn('uni.createVideoContext 必须传入第二个参数，即当前 vm 对象(this)')
    }
    const elm = findElmById(id, vm);
    if (!elm) {
      return console.warn('Can not find `' + id + '`')
    }
    return new VideoContext(id, elm)
  }

  function requireNativePlugin$1 (name) {
    return weex.requireModule(name)
  }

  const ANI_DURATION$1 = 300;
  const ANI_SHOW$1 = 'pop-in';
  const ANI_CLOSE = 'pop-out';

  function showWebview (webview, animationType, animationDuration, callback) {
    setTimeout(() => {
      webview.show(
        animationType || ANI_SHOW$1,
        parseInt(animationDuration) || ANI_DURATION$1,
        () => {
          callback && callback();
        }
      );
    }, 50);
  }

  let firstBackTime = 0;

  function quit () {
    if (!firstBackTime) {
      firstBackTime = Date.now();
      plus.nativeUI.toast('再按一次退出应用');
      setTimeout(() => {
        firstBackTime = null;
      }, 2000);
    } else if (Date.now() - firstBackTime < 2000) {
      plus.runtime.quit();
    }
  }

  function backWebview (webview, callback) {
    if (!webview.__uniapp_webview) {
      return callback()
    }
    const children = webview.children();
    if (!children || !children.length) { // 有子 webview
      return callback()
    }
    const childWebview = children[0];
    childWebview.canBack(({
      canBack
    }) => {
      if (canBack) {
        childWebview.back(); // webview 返回
      } else {
        callback();
      }
    });
  }

  function back (delta, animationType, animationDuration) {
    const pages = getCurrentPages();
    const len = pages.length;
    const currentPage = pages[len - 1];

    if (delta > 1) {
      // 中间页隐藏
      pages.slice(len - delta, len - 1).reverse().forEach(deltaPage => {
        deltaPage.$getAppWebview().close('none');
      });
    }

    backWebview(currentPage, () => {
      if (animationType) {
        currentPage.$getAppWebview().close(animationType, animationDuration || ANI_DURATION$1);
      } else {
        if (currentPage.$page.openType === 'redirect') { // 如果是 redirectTo 跳转的，需要制定 back 动画
          currentPage.$getAppWebview().close(ANI_CLOSE, ANI_DURATION$1);
        }
        currentPage.$getAppWebview().close('auto');
      }

      pages.slice(len - delta, len).forEach(page => page.$remove());

      setStatusBarStyle();

      UniServiceJSBridge.emit('onAppRoute', {
        type: 'navigateBack'
      });
    });
  }

  function navigateBack$1 ({
    from = 'navigateBack',
    delta,
    animationType,
    animationDuration
  }) {
    const pages = getCurrentPages();

    const currentPage = pages[pages.length - 1];
    if (
      currentPage.$vm &&
      currentPage.$vm.$options.onBackPress &&
      currentPage.$vm.__call_hook &&
      currentPage.$vm.__call_hook('onBackPress', {
        from
      })
    ) {
      return
    }

    uni.hideToast(); // 后退时，关闭 toast,loading

    currentPage.$page.meta.isQuit
      ? quit()
      : back(delta, animationType, animationDuration);
  }

  function navigateTo$1 ({
    url,
    animationType,
    animationDuration
  }) {
    const urls = url.split('?');
    const path = urls[0];

    const query = parseQuery(urls[1] || '');

    UniServiceJSBridge.emit('onAppRoute', {
      type: 'navigateTo',
      path
    });

    showWebview(
      __registerPage({
        path,
        query,
        openType: 'navigate'
      }),
      animationType,
      animationDuration
    );

    setStatusBarStyle();
  }

  function reLaunch$1 ({
    url
  }) {
    const urls = url.split('?');
    const path = urls[0];

    const query = parseQuery(urls[1] || '');

    const pages = getCurrentPages(true).slice(0);

    const routeOptions = __uniRoutes.find(route => route.path === path);

    if (routeOptions.meta.isTabBar) {
      tabBar.switchTab(url);
    }

    showWebview(
      __registerPage({
        path,
        query,
        openType: 'reLaunch'
      }),
      'none',
      0
    );

    pages.forEach(page => {
      page.$remove();
      page.$getAppWebview().close('none');
    });

    setStatusBarStyle();
  }

  function redirectTo$1 ({
    url
  }) {
    const urls = url.split('?');
    const path = urls[0];

    const query = parseQuery(urls[1] || '');

    const pages = getCurrentPages();
    const lastPage = pages[pages.length - 1];

    lastPage && lastPage.$remove();

    showWebview(
      __registerPage({
        path,
        query,
        openType: 'redirect'
      }),
      'none',
      0,
      () => {
        lastPage && lastPage.$getAppWebview().close('none');
      }
    );

    setStatusBarStyle();
  }

  function switchTab$1 ({
    url,
    from
  }) {
    const path = url.split('?')[0];

    tabBar.switchTab(path.slice(1));

    const pages = getCurrentPages();
    const len = pages.length;

    if (len >= 1) { // 前一个页面是非 tabBar 页面
      const currentPage = pages[len - 1];
      if (!currentPage.$page.meta.isTabBar) {
        pages.reverse().forEach(page => {
          if (!page.$page.meta.isTabBar && page !== currentPage) {
            page.$remove();
            page.$getAppWebview().close('none');
          }
        });
        currentPage.$remove();
        if (currentPage.$page.openType === 'redirect') {
          currentPage.$getAppWebview().close(ANI_CLOSE, ANI_DURATION$1);
        } else {
          currentPage.$getAppWebview().close('auto');
        }
      } else {
        // 前一个 tabBar 触发 onHide
        currentPage.$vm.__call_hook('onHide');
      }
    }

    let tabBarPage;
    // 查找当前 tabBarPage，且设置 visible
    getCurrentPages(true).forEach(page => {
      if (('/' + page.route) === path) {
        page.$page.meta.visible = true;
        tabBarPage = page;
      } else {
        if (page.$page.meta.isTabBar) {
          page.$page.meta.visible = false;
        }
      }
    });

    if (tabBarPage) {
      tabBarPage.$vm.__call_hook('onShow');
      tabBarPage.$getAppWebview().show('none');
    } else {
      showWebview(
        __registerPage({
          path,
          query: {},
          openType: 'switchTab'
        })
      );
    }

    setStatusBarStyle();
  }



  var nvueApi = /*#__PURE__*/Object.freeze({
    createLivePusherContext: createLivePusherContext,
    createMapContext: createMapContext$1,
    createVideoContext: createVideoContext$1,
    requireNativePlugin: requireNativePlugin$1,
    navigateBack: navigateBack$1,
    navigateTo: navigateTo$1,
    reLaunch: reLaunch$1,
    redirectTo: redirectTo$1,
    switchTab: switchTab$1
  });

  var platformApi = Object.assign(Object.create(null), appApi, nvueApi);

  var api$2 = Object.assign(Object.create(null), api$1, platformApi);

  const uni$1 = Object.create(null);

  apis_1.forEach(name => {
    if (api$2[name]) {
      uni$1[name] = promisify(name, wrapper(name, api$2[name]));
    } else {
      uni$1[name] = wrapperUnimplemented(name);
    }
  });

  function publishHandler (event, args, pageId) {
    // TODO
  }

  UniServiceJSBridge.publishHandler = publishHandler;
  UniServiceJSBridge.invokeCallbackHandler = invokeCallbackHandler;

  var index = {
    __registerConfig: registerConfig,
    __registerApp: registerApp,
    __registerPage: registerPage,
    uni: uni$1,
    getApp,
    getCurrentPages: getCurrentPages$1
  };

  return index;

}());

var uni = serviceContext.uni
var getApp = serviceContext.getApp
var getCurrentPages = serviceContext.getCurrentPages

var __registerPage = serviceContext.__registerPage

return serviceContext 
}
