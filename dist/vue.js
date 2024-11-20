(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _arrayWithHoles(r) {
    if (Array.isArray(r)) return r;
  }
  function _classCallCheck(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _defineProperties(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o);
    }
  }
  function _createClass(e, r, t) {
    return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
      writable: !1
    }), e;
  }
  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e,
        n,
        i,
        u,
        a = [],
        f = !0,
        o = !1;
      try {
        if (i = (t = t.call(r)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = !1;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
      } catch (r) {
        o = !0, n = r;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _slicedToArray(r, e) {
    return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
  }

  /**
   * 重写数组中的部分方法
   */

  // 获取数组的原型
  var oldArrayProto = Array.prototype;
  var newArrayProto = Object.create(oldArrayProto);
  var methods = [
  // 找到所有变异方法
  'push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']; // concat slice 都不会改变原数组，所以不需要重写

  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      var _oldArrayProto$method;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      // 重写方法
      // 内部调用原方法
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args));

      //对新增的数据再次劫持
      var inserted;
      var ob = this.__ob__;
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;
        case 'splice':
          inserted = args.slice(2);
          break;
      }
      if (inserted) {
        ob.observeArray(inserted);
      }
      ob.dep.notify(); // 数组变化了，通知watcher进行更新

      return result;
    };
  });

  var id$1 = 0;
  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);
      this.id = id$1++;
      this.subs = []; // 这里存放着当前属性对应的watcher有哪些
    }
    return _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // 这里不希望放重复的watcher
        // this.subs.push(Dep.target)
        Dep.target.addDep(this); // 让watcher记住dep
      }
    }, {
      key: "addSub",
      value: function addSub(Watcher) {
        this.subs.push(Watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          watcher.update();
        });
      }
    }]);
  }();
  Dep.target = null;
  var stack = [];
  function pushStack(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
  }
  function popStack() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);
      // Object.deineProperty只能劫持已经存在的属性（vue会为此单独写一些api $set $delete）

      /**
       * 给数据加上一个标识，如果数据上有__ob__属性，则说明已经被劫持过了
       * 但是在对象中增加__ob__后进入walk方法，会对__ob__进行监测，里边又会有walk导致进入死循环
       * 所以设置__ob__为一个隐藏属性，不可被枚举
       */

      new Dep();
      data.__ob__ = this;
      if (Array.isArray(data)) {
        // 对数组进行劫持：重写数组中的方法
        data.__proto__ = newArrayProto; // 重写数组原型
        this.observeArray(data); // 如果数组中监测的是对象，可以监控到对象的变化
      } else {
        this.walk(data); // 循环对象，对属性依次劫持
      }
    }
    return _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        // 循环对象，对属性依次劫持

        // 重新定义属性
        Object.keys(data).forEach(function (key) {
          defineReactive(data, key, data[key]);
        });
      }

      /**
       * 监测数组
       * 
       */
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          observe(item);
        });
      }
    }]);
  }(); //深层次嵌套会递归，递归多了性能差，不存在属性监控不到，存在的属性要重写方法vue3-> proxy
  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i];
      current === null || current === void 0 || current.dep.depend();
      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  }
  function defineReactive(target, key, value) {
    // 闭包 属性劫持
    var childob = observe(key); // 如果仍旧是一个对象，则递归劫持 childOb.dep用来收集依赖

    var dep = new Dep();
    Object.defineProperty(target, key, {
      get: function get() {
        // 取值的时候会执行get
        if (Dep.target) {
          dep.depend(); // 让这个属性的收集器记住当前的watcher
          if (childob) {
            childob.dep.depend(); // 让数组和对象本身也能实现依赖收集
            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }
        return value;
      },
      set: function set(newValue) {
        // 赋值的时候会执行set
        if (newValue === value) return;
        observe(newValue);
        value = newValue;
        dep.notify();
      }
    });
  }
  function observe(data) {
    // 对这个对象进行劫持

    if (_typeof(data) !== 'object' || data === null) {
      return; // 只对对象进行劫持
    }

    // 如果一个对象被劫持过，则不再劫持
    // 判断一个对象是否被接触过，可以增添一个实例，用实例来判断是否被劫持过
    if (data.__ob__ instanceof Observer) {
      return data.__ob__;
    }
    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options; // 获取用户的选项

    // if(opts.props){
    //     initProps(vm, opts.props);
    // }

    if (opts.data) {
      initData(vm);
    }
  }
  function proxy(vm, target, key) {
    // 让data数据能够直接从实例上获取
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newVal) {
        vm[target][key] = newVal;
      }
    });
  }
  function initData(vm) {
    var data = vm.$options.data;

    /**
     * 这里源代码是直接使用data.call(vm)
     * 我实现时若data为function执行之后仍旧是function，所以这里将data覆盖，以此得到data的返回值
     */
    typeof data === 'function' ? data = data.call(vm) : data;
    vm._data = data; // 无论data是function还是object，都要处理成object绑定到vm实例上
    // 劫持数据，vue2采用 defineProperty
    observe(data);

    // 将vm._data用vm来代理就可以了
    for (var key in data) {
      proxy(vm, '_data', key);
    }
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnamecapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnamecapture)); // 标签开始
  var endTag = new RegExp("^<\\/".concat(qnamecapture, "[^>]*>")); // 标签结束
  var attribute = /^\s*([^\s<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>]+)))?/;
  var startTagClose = /^s*(\/?)>/; // <div><br/>

  // vue3不是采用正则，而是每个字符进行匹配

  /**
   * 解析html
   * 思路：解析一段就删除一段，直至没有能解析的数据
   */

  function parseHTML(html) {
    /**
    * 解析到标签、文本、结尾时的处理函数
    * 最终要生成一颗抽象语法树
    * 利用栈来实现，类似于括号匹配
    */
    var ELMENTTYPE = 1;
    var TEXTTYPE = 3;
    var stack = []; // 用于存放元素
    var currentParent; // 栈顶指针
    var root;
    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELMENTTYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }
    function start(tag, attrs) {
      // console.log('开始',tag,attrs);
      var node = createASTElement(tag, attrs);
      if (!root) {
        root = node;
      }
      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node);
      }
      stack.push(node);
      currentParent = node;
    }
    function chars(text) {
      // console.log('文本',text);
      text = text.replace(/\s/g, '');
      text && currentParent.children.push({
        type: TEXTTYPE,
        text: text,
        parent: currentParent
      });
    }
    function end(tag) {
      // console.log('结束',tag);
      stack.pop();
      currentParent = stack[stack.length - 1];
    }

    /**
     * 解析HTML主体代码
     */
    function advance(n) {
      // 向前移动n个字符(刪除)
      html = html.substring(n);
    }
    function parseStartTag() {
      var start = html.match(startTagOpen); // 匹配开始标签
      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length);
        var _end, attr;
        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
        }
        if (_end) {
          advance(_end[0].length);
        }
        return match;
      }
      return false; // 不是开始标签
    }
    while (html) {
      // 一定是<开始
      // 如果textEnd 为0 说明是一个开始标签或者结束标签
      // 如果textEnd >@说明就是文本的结束位置
      var textEnd = html.indexOf('<');
      if (textEnd == 0) {
        var startTagMatch = parseStartTag();
        if (startTagMatch) {
          // 解析到的开始标签
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          // 解析到的结束标签
          end(endTagMatch[1]);
          advance(endTagMatch[0].length);
          continue;
        }
      }
      if (textEnd > 0) {
        // 解析文本内容
        var text = html.substring(0, textEnd);
        if (text) {
          chars(text);
          advance(textEnd);
        }
      }
    }
    return root;
  }

  function genProps(attrs) {
    var str = '';
    var _loop = function _loop() {
      var attr = attrs[i];
      if (attr.name === 'style') {
        var obj = {};
        attr.value.split(';').forEach(function (item) {
          var _item$split = item.split(':'),
            _item$split2 = _slicedToArray(_item$split, 2),
            key = _item$split2[0],
            value = _item$split2[1];
          if (typeof value == 'string') {
            value = value.trim();
          }
          obj[key] = value;
        });
        attr.value = obj;
      }
      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    };
    for (var i = 0; i < attrs.length; i++) {
      _loop();
    }
    return "{".concat(str.slice(0, -1), "}");
  }
  function genChildren(children) {
    return children.map(function (child) {
      return gen(child);
    }).join(',');
  }
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 用于匹配{{}}
  function gen(node) {
    if (node.type === 1) {
      return codegen(node);
    } else {
      var text = node.text;
      if (!defaultTagRE.test(text)) {
        return "_v('".concat(text, "')");
      } else {
        var tokens = [];
        var match;
        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;
        while (match = defaultTagRE.exec(text)) {
          var index = match.index;
          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }
          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }
        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }
  function codegen(ast) {
    var children = ast.children;
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : null, ",").concat(children.length > 0 ? genChildren(children) : '', ")");
    return code;
  }
  function compileToFunction(template) {
    //1.就是将template 转化成ast语法树

    var ast = parseHTML(template); // 解析html模板
    console.log('ast', ast);

    //2.生成render方法(render方法返回的结果就是 虚拟D0M)
    // codegen(ast); // 生成render方法
    var code = codegen(ast);
    console.log(code, 'code');
    // 模板引擎的实现原理就是with + new Function
    var render = new Function("with(this){return ".concat(code, "}"));
    return render;
  }

  var id = 0;
  var Watcher = /*#__PURE__*/function () {
    // 不同的的组件有不同的watcher
    function Watcher(vm, fn, options) {
      _classCallCheck(this, Watcher);
      this.id = id++;
      this.renderWatcher = options; // 标识是一个渲染watcher
      this.getter = fn; // getter会发生取值操作

      this.deps = [];
      this.depsId = new Set();
      this.get();
    }
    return _createClass(Watcher, [{
      key: "get",
      value: function get() {
        // Dep.target = this;// 静态属性，只有一份
        pushStack(this);
        this.getter(); // 会去vm上取值，vm._update(vm._render())
        // Dep.target = null;// 渲染完毕后就清空
        popStack();
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;
        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this); // watcher已经记住了dep并且已经去重，此时让dep记住watcher即可
        }
      }
    }, {
      key: "update",
      value: function update() {
        // 执行更新
        // this.get();// 重新渲染
        queueWatcher(this); // 把当前的watcher保存起来
      }
    }, {
      key: "run",
      value: function run() {
        this.get(); // 真正执行渲染
      }
    }]);
  }(); // notify更新操作（异步）
  var queue = [];
  var has = {};
  var pending = false; // 防抖

  function flushSchedulerQueue() {
    var flushQueue = queue.slice(0);
    queue = [];
    has = {};
    pending = false;
    flushQueue.forEach(function (q) {
      return q.run();
    });
  }
  function queueWatcher(watcher) {
    var id = watcher.id;
    if (!has[id]) {
      queue.push(watcher);
      has[id] = true;

      // 不管update执行多少次，最终只会有一轮刷新操作
      if (!pending) {
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }
  var callbacks = [];
  var waiting = false;
  function flushCallBacks() {
    var cbs = callbacks.slice(0);
    waiting = false;
    callbacks = [];
    cbs.forEach(function (cb) {
      return cb();
    });
  }

  // vue中nextTick 没有直接使用某个api 而是采用优雅降级的方式
  //内部先采用的是promise(ie不兼容) Mutation0bserver 可以考虑ie专享的 setImmediate
  // 使异步更新方案能兼容各种浏览器
  var timerFunc;
  if (Promise) {
    timerFunc = function timerFunc() {
      Promise.resolve().then(flushCallBacks);
    };
  } else if (MutationObserver) {
    var observer = new MutationObserver(flushCallBacks); // 这里回调是异步执行的
    var textNode = document.createTextNode(1);
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function timerFunc() {
      textNode.textContent = 2;
    };
  } else if (setImmediate) {
    setImmediate(flushCallBacks);
  } else {
    timerFunc = function timerFunc() {
      setTimeout(flushCallBacks);
    };
  }
  function nextTick(cb) {
    callbacks.push(cb);
    if (!waiting) {
      // setTimeout(()=>{
      //     flushCallBacks();
      // },0)
      timerFunc();
      waiting = true;
    }
  }

  /**
   * _c
   */
  function createElement(vm, tag, data) {
    if (data == null) {
      data = {};
    }
    var key = data.key;
    if (key) {
      delete data.key;
    }
    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }
    return vnode(vm, tag, key, data, children);
  }

  /**
   * _v
   */
  function createTextNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }
  function vnode(vm, tag, key, props, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      props: props,
      children: children,
      text: text
      // ...
    };
  }

  /**
   * 创建真实节点
   */
  function createElm(vnode) {
    var tag = vnode.tag,
      props = vnode.props,
      children = vnode.children,
      text = vnode.text;
    if (typeof tag === 'string') {
      vnode.el = document.createElement(tag);
      patchProps(vnode.el, props);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      // 文本节点
      vnode.el = document.createTextNode(text);
    }
    return vnode.el;
  }
  function patchProps(el, props) {
    for (var key in props) {
      if (key === 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(key, props[key]);
      }
    }
  }
  function patch(oldVNode, vnode) {
    var isRealNode = oldVNode.nodeType;
    if (isRealNode) {
      var elm = oldVNode; // 获取到真实元素
      var parentElm = elm.parentNode; // 获取父元素

      var newElm = createElm(vnode);
      parentElm.insertBefore(newElm, elm.nextSibling);
      parentElm.removeChild(elm);
      return newElm;
    }
  }
  function initLifecycle(Vue) {
    Vue.prototype._update = function (vnode) {
      // 将虚拟dom转化成真实dom   
      var vm = this;
      var el = vm.$el;
      //既有初始化功能，又有更新功能
      vm.$el = patch(el, vnode);
    };
    Vue.prototype._render = function () {
      var vm = this;
      return vm.$options.render.call(vm); // render内部的this设置为vm
    };
    // render函数内部的函数
    Vue.prototype._c = function () {
      return createElement.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._v = function () {
      return createTextNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._s = function (value) {
      if (_typeof(value) == 'object') return value;
      return JSON.stringify(value);
    };
  }
  function mountComponent(vm, el) {
    vm.$el = el;
    // 1.调用render方法，生成虚拟dom

    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    };
    var watcher = new Watcher(vm, updateComponent, true); // true标识是一个渲染watcher
    console.log('watcher', watcher);

    // 2.根据虚拟dom生成真实dom

    // 3.将真实dom挂载到el上
  }

  //vue核心流程 1、创造力响应式数据；2、模板转换成ast语法树
  // 3、将ast语法树转换成render函数 4、后续每次数据更新可以只执行render函数（无需再次执行ast转化的过程）

  // render函数会产生虚拟节点（使用响应式数据）
  // 根据生成的虚拟节点创造真实dom

  function initMixin(Vue) {
    // 给Vue增加init方法
    Vue.prototype._init = function (options) {
      // 初始化操作
      var vm = this;
      vm.$options = options; // 将用户的选项挂载到实例上

      // 初始化状态
      initState(vm);
      if (options.el) {
        vm.$mount(options.el); // 实现数据的挂载
      }
    };
    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options;
      if (!ops.render) {
        // 先查看有没有render函数
        var template; // 没有render看下是否写了template，没写template采用外部的模板
        if (!ops.template && el) {
          // 没有写模板，但是写了el
          template = el.outerHTML;
        } else {
          if (el) {
            template = ops.template; // 如果有el，则采用模板的内容
          }
        }

        // 写了template，就用写了的template
        if (template) {
          // 对模版编译
          var render = compileToFunction(template); // 将模板编译成render函数
          ops.render = render; // jsx最终会被编译成 h('xxx')
        }
      }

      // ops.render;
      mountComponent(vm, el);
    };
  }

  function Vue(options) {
    // options是用户的选项
    this._init(options);
  }
  initMixin(Vue); // 扩展了init方法
  initLifecycle(Vue); // 扩展了生命周期方法

  return Vue;

}));
//# sourceMappingURL=vue.js.map
