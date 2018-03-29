;
/**
 * xjg
 * create: 2017-06-10
 **/
function canvasObj(dom, config) {
    var self = this;

    //方法需要保存变量值时的存放对象
    var _VariableStorage = {};
    //模块列表
    var module_list = [];

    var History = { data: [], index: 0 };
    // 初始化参数, 并开始执行
    var init = function() {
        //存放所有对象
        self.DisplayList = [];
        //对齐线
        _VariableStorage.Snaplines = [];
        //一厘米多少个像素
        self.cmToDots = 38; 
        //canvas dom
        self._dom = dom;
        //canvas 画图方法
        self._draw = dom.getContext('2d');
        //等待更新队列数
        self._updateQueue = 0;
        //设置配置
        self.config = config || {};
        //设置模式
        self.config.Print_Mode = self.config.Print_Mode || 'edit';
        //设置宽度
        if(self.config.width == undefined){
            self.config.width = 21;
        }
        //设置高度
        if(self.config.height == undefined){
            self.config.height = 14;
        }
        //加载模块
        Module.forEach(function(fun, index) {
            require(index);
        });
        //设置画布宽度高度
        if(self.config.Print_Mode == 'edit'){
            self.setWidth(self.config.width);
            self.setHeight(self.config.height);
        }else {
            // self._dom.width = self.config.width * self.cmToDots;
            // self._dom.height = self.config.height * self.cmToDots;
        }

    };
    //模块加载方法
    var require = function(index) {
        if (module_list[index] == undefined) {
            module_list[index] = {};
            Module[index](module_list[index], require);

        }
        return module_list[index];
    }

    var Module = [

        /****************************************************************
         * 0 事件处理类
         * create: 2017-06-12 17:08:47
         ****************************************************************/
        function(exports, require) {
            exports.className = '0.事件处理类';

            var extend = require(2).extend;
            var findHover = require(2).findHover;
            var ctrlZY = new(require(2).ctrlZY)();
            //事件分发列表
            var eventTriggerList = {};
            //内部事件列表
            var eventHandlersList = {};
            //鼠标监听事件列表
            var MouseEventList = ['click', 'dblclick', 'mousemove', 'mousedown', 'mouseup', 'mouseout'];
            //键盘监听事件列表
            var KeyEventList = ['keydown', 'keyup'];
            /**
             * 内部事件初始化
             * create: 2017-06-12 11:19:25
             * update: 2017-06-13 10:37:30
             **/
            var init_eventHandlers = function() {
                eventHandlersList = {
                    'global': [],
                    'displayable': []
                };
                MouseEventList.forEach(function(name) {
                    eventHandlersList['global'][name] = [];
                    eventHandlersList['displayable'][name] = [];
                });
                KeyEventList.forEach(function(name) {
                    eventHandlersList['global'][name] = [];
                    eventHandlersList['displayable'][name] = [];
                });
                eventHandlersList['global']['keydown'].push(function(d, event) {

                });
                eventHandlersList['global']['keyup'].push(function(d, event) {
                    if (event.ctrlKey && event.keyCode == 90) {
                        ctrlZY.back();
                    } else if (event.ctrlKey && event.keyCode == 89) {
                        ctrlZY.recovery();
                    }
                });
                // eventHandlersList['global']['mouseup'].push(function(displayable) {
                //     extend(displayable, eventHandlersList.current_displayable);
                //     eventHandlersList.current_displayable = undefined;
                // });
                //对象拖动事件
                if(self.config.Print_Mode == 'edit'){
                    var dragHandlers = require(2).dragHandlers;
                    eventHandlersList['displayable']['mousedown'].push(dragHandlers.down_handlers);
                    eventHandlersList['global']['mouseup'].push(dragHandlers.up_handlers);
                    eventHandlersList['global']['mousemove'].push(dragHandlers.move_handlers);
                }
            };
            /**
             * 事件分发
             * create: 2017-06-12 09:42:44
             * update: 2017-06-12 16:39:41
             **/
            var eventTrigger = function() {
                KeyEventList.forEach(function(name) {
                    $('body').on(name, function(e) {
                        eventHandlers(name, null, e);
                    });
                });
                MouseEventList.forEach(function(name) {
                    self._dom.addEventListener(name, function(e) {
                        var displayable = findHover(e.offsetX - 1, e.offsetY - 1, function(displayable) {
                            eventHandlers(name, displayable, e);
                            if (displayable) {
                                displayable = extend({}, displayable, { event: e });
                                if (typeof displayable._handlers[name] == 'function') {
                                    if (displayable._handlers[name](displayable)) return false;
                                }
                                if (typeof eventTriggerList[name] == 'function') {
                                    if (eventTriggerList[name](displayable)) return false;
                                }
                            }
                            return true;
                        });

                        if (e.type == 'mousedown') {
                            if (displayable == null || !/scale_[1-8]/.test(displayable.id))
                                self.hideScale();
                        }
                        if (e.type == 'mousemove') {
                            if (!displayable || !displayable.isDrag || !displayable.isPrint) {
                                $('body').css('cursor', 'auto')
                            } else if (displayable.isDrag) {
                                if (!/scale_[1-8]/.test(displayable.id)) {
                                    $('body').css('cursor', 'auto')
                                } else {
                                    var cursor_list = [
                                        '', 'nw-resize', 'n-resize', 'ne-resize', 'w-resize',
                                        'e-resize', 'sw-resize', 's-resize', 'se-resize'
                                    ];
                                    $('body').css('cursor', cursor_list[displayable.id.replace(/scale_([1-8])/, '$1')]);
                                }

                            }
                        }
                        // var hovered = findHover(e.offsetX - 1, e.offsetY - 1);
                        // eventHandlers(name, hovered, e);
                        // if (hovered) {
                        //     hovered = extend(hovered, { event: e });
                        //     if (typeof hovered._handlers[name] == 'function') {
                        //         if (!hovered._handlers[name](hovered)) return;
                        //     }
                        //     if (typeof eventTriggerList[name] == 'function') {
                        //         return eventTriggerList[name](hovered);
                        //     }
                        // }
                    });
                });
            };
            /**
             * 内部事件处理
             * create: 2017-06-12 10:54:26
             * update: 2017-06-12 16:39:32
             **/
            var eventHandlers = function(name, displayable, event) {
                if (displayable != null) {
                    eventHandlersList['displayable'][name].forEach(function(_handlers) {
                        _handlers(displayable, event);
                    });
                }
                eventHandlersList['global'][name].forEach(function(_handlers) {
                    _handlers(displayable, event);
                });
            };
            /**
             * 事件监听
             **/
            var on = function(name, dataIndex, callback) {
                if (typeof dataIndex == 'function') {
                    eventTriggerList[name] = dataIndex;
                } else if (typeof self.DisplayList[dataIndex] != 'undefined') {
                    self.DisplayList[dataIndex]._handlers[name] = callback;
                }
            };

            init_eventHandlers();
            eventTrigger();

            exports.on = on;
        },



        /**************************************************************
         * 1 对外接口类
         * create：2017-06-12 16:56:14
         **************************************************************/
        function(exports, require) {
            exports.className = '1.对外接口类';

            self.on = require(0).on;
            self.findHover = require(2).findHover;
            self.findById = require(2).findById;
            var addToList = require(2).addToList;
            var getRect = require(2).getRect;
            var extend = require(2).extend;
            var parentAndChild = new(require(2).parentAndChild)();

            //导出
            self.export = function() {
                var tmp = [];
                var id_list = [
                    '', 'head_title', 'head_title_text', '', 'data_head_title',
                    'data_head_title_text', '', 'data_main_title', 'data_main_title_text',
                    'data_footer_title', 'data_footer_title_text',
                    '', 'footer_title', 'footer_title_text'
                ];
                for (var i = 13; i < self.DisplayList.length; i++) {
                    if(self.DisplayList[i] == undefined)continue;
                    tmp.push(extend({}, self.DisplayList[i]));
                    var tmp2 = tmp[tmp.length - 1].childs;
                    if (id_list.includes(tmp[tmp.length - 1].id)) {
                        tmp[tmp.length - 1].isPrint = false;
                    }
                    tmp[tmp.length - 1].childs = [];
                    delete tmp[tmp.length - 1].rect;
                    delete tmp[tmp.length - 1].borderStyle.img;
                    for (var key in tmp2) {
                        tmp[tmp.length - 1].childs.push(tmp2[key]);
                    }
                }
                var preview_data = {
                    tpl_data: tmp,
                    config: extend({}, self.config)
                };
                preview_data.config.Print_Mode = 'preview';
                return preview_data;
            };
            /**
             * 获取文本宽度
             * 2017-06-12 10:18:48
             **/
            self.measureText = function(text, font_size) {
                var tmp = self._draw.font;
                self._draw.font = font_size + 'px 宋体';
                var res = self._draw.measureText(text).width;
                self._draw.font = tmp;
                return res;
            };
            //删除对象
            self.delete = function(index){
                if(self.DisplayList[index]){
                    delete self.DisplayList[index];
                    self.hideScale();
                }
            };
            // 设置对象属性 
            self.set = function(index, opt, Refresh) {
                var displayable = self.DisplayList[index];
                if (typeof opt == 'object') {
                    extend(displayable, opt);
                } else {
                    return;
                }
                // if(displayable.type == 'text'){
                //     displayable.width = self.measureText(displayable.text);
                // }
                displayable.rect = getRect(displayable.x, displayable.y, displayable.borderStyle.width, displayable.borderStyle.height);

                if (Refresh == undefined || Refresh != false) {
                    parentAndChild.judge(self.DisplayList[index]);
                    self._updateQueue++;
                }
            };
            /**
             * 添加文本
             * create: 2017-06-10
             * update: 2017-06-12 16:39:06
             **/
            self.addText = function(params) {
                params.type = 'text';
                params.text = params.text != undefined ? params.text : '';
                params.font_size = params.font_size != undefined ? params.font_size : 24;
                params.x = params.x != undefined ? params.x : 0;
                params.y = (params.y != undefined ? params.y : 0);
                params.rect = getRect(params.x, params.y, params.width, params.font_size);
                params.isDrag = params.isDrag != undefined ? params.isDrag : false;
                // params.border = params.border != undefined ? params.border : false;
                params.valign = params.valign != undefined ? params.valign : 'centen';
                params.align = params.align != undefined ? params.align : 'centen';
                params.color = params.color != undefined ? params.color : '#000';
                params.bold = params.bold != undefined ? params.bold : false;
                params.oblique = params.oblique != undefined ? params.oblique : false;
                params.simple = params.simple != undefined ? params.simple : false;
                params.borderStyle = extend({
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    width: 120,
                    height: params.font_size
                }, params.borderStyle);
                var dataIndex = addToList(params);
                // _VariableStorage.dragHandlers.displayable = self.DisplayList[dataIndex];
                // _VariableStorage.dragHandlers.startDrag = true;
                // _VariableStorage.dragHandlers.upX = 0;
                // _VariableStorage.dragHandlers.upY = 0;
                return dataIndex;
            };
            /**
             * 绘制矩形
             * create: 2017-06-14 08:54:46
             **/
            self.addRect = function(params) {
                params.type = 'rect';
                params.x = params.x != undefined ? params.x : 0;
                params.y = params.y != undefined ? params.y : 0;
                params.isDrag = params.isDrag != undefined ? params.isDrag : false;
                params.borderStyle = extend({
                    top: 1,
                    right: 1,
                    bottom: 1,
                    left: 1,
                    width: 120,
                    height: 120
                }, params.borderStyle);
                params.rect = getRect(params.x, params.y, params.borderStyle.width, params.borderStyle.height);
                return addToList(params);
            };
            /**
             * 绘制图片
             **/
            self.addImg = function(params) {
                params.type = 'icon';
                params.x = params.x != undefined ? params.x : 0;
                params.y = params.y != undefined ? params.y : 0;
                params.isDrag = params.isDrag != undefined ? params.isDrag : false;
                params.borderStyle = extend({
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }, params.borderStyle);
                if(params.img){
                    var canvas = document.createElement('canvas');
                    canvas.width = params.img.width;
                    canvas.height = params.img.height;
                    canvas.getContext('2d').drawImage(params.img, 0, 0);
                    delete params.img;
                    return setImg(canvas.toDataURL(),canvas.width, canvas.height);
                }else {
                    openFile();
                }
                function openFile(){
                    var openFile = document.createElement('input');
                    openFile.type = 'file';
                    openFile.addEventListener('change', function() {
                        if (openFile.files[0].size >= 32 * 1024) return alert('图片大小不能超过32K');
                        var reader = new FileReader();
                        console.log(openFile.files[0]);
                        reader.readAsDataURL(openFile.files[0]);
                        reader.onload = function(e) {
                            var img = new Image();
                            img.src = e.target.result;
                            img.onload = function() {
                                setImg(e.target.result, img.width, img.height);
                            };
                        };
                    });
                    openFile.click();
                }
                function setImg(dataUrl, width, height){
                    params.dataUrl = dataUrl;
                    params.borderStyle.width = width;
                    params.borderStyle.height = height;
                    var dataIndex = addToList(params);
                    // _VariableStorage.dragHandlers.displayable = self.DisplayList[dataIndex];
                    // _VariableStorage.dragHandlers.startDrag = true;
                    // _VariableStorage.dragHandlers.upX = 0;
                    // _VariableStorage.dragHandlers.upY = 0;
                    return dataIndex;
                }
            };
            /**
             * 绘制二维码
             * create: 2017-08-01 14:49:11
             **/
            self.addQrBar = function(params) {
                params.type = params.type;
                params.x = params.x != undefined ? params.x : 0;
                params.y = params.y != undefined ? params.y : 0;
                params.isDrag = params.isDrag != undefined ? params.isDrag : false;
                params.text = params.title.text;
                // params.title = {
                //     text: '二维码'
                // };
                params.borderStyle = extend({
                    top: 1,
                    right: 1,
                    bottom: 1,
                    left: 1,
                    width: 120,
                    height: 120
                }, params.borderStyle);
                // params.rect = getRect(params.x, params.y, params.borderStyle.width, params.borderStyle.height);
                return addToList(params);
            };
            /**
             * 截取文本
             **/
            self.substr = function(text, font_size ,len , start){
                var res = '';
                start = start ? start : 0;
                for(var i = start; i < text.length; i++){
                    res += text[i];
                    if(self.measureText(res, font_size) > len){
                        res = res.substr(0, res.length - 1);
                        return res;
                    };
                }
                return res;
            };
            /**
             * 分段
             **/
            self.subsection = function(text, font_size, max_len){
                var res = [];
                var tmp = '';
                while(tmp.length < text.length){
                    var tmp2 = self.substr(text, font_size, max_len, tmp.length);
                    if(tmp2 == '')tmp2 = text[tmp.length];
                    tmp += tmp2;
                    res.push(tmp2);
                }
                return res;
            }
        },



        /****************************************************************
         * 2 内部方法
         * create：2017-06-12 17:10:14
         * update: 2017-06-13 14:34:45
         ****************************************************************/
        function(exports, require) {
            exports.className = '2.内部方法';
            //添加对象 到 列表
            var addToList = function(displayable) {
                displayable.id = displayable.id ? displayable.id : 'id_' + (new Date().getTime().toString().substr(3)) + (parseInt(Math.random() * 10000));
                displayable.dataIndex = self.DisplayList.length;
                displayable.zIndex = displayable.zIndex != undefined ? displayable.zIndex : displayable.dataIndex;
                displayable.isParent = displayable.isParent ? true : false;
                displayable.parentDataIndex = undefined;
                displayable.childs = {};
                displayable._handlers = {};
                self.DisplayList.push(displayable);
                self.set && self.set(displayable.dataIndex, displayable);
                return displayable.dataIndex;
            };
            window.addToList = addToList;
            self.addToList = addToList;
            //根据参数 获取对应矩形路径数据
            var getRect = function(x, y, width, height) {
                y -= 1;
                return [
                    { x: x, y: y },
                    { x: x + width, y: y },
                    { x: x + width, y: y + height },
                    { x: x, y: y + height }
                ];
            };
            /**
             * obj对象合并
             * create：2017-06-13 14:09:33
             * update：2017-06-13 14:44:25
             **/
            var extend = function() {
                if (arguments.length == 0) return {};
                var target = arguments[0];
                if (target == null || typeof target != 'object' || Array.isArray(target)) {
                    target = {};
                }
                for (var i = 1; i < arguments.length; i++) {
                    for (var key in arguments[i]) {
                        if (arguments[i][key] != null && typeof arguments[i][key] == 'object' && !Array.isArray(arguments[i][key])) {
                            if (target[key] == null || typeof target[key] != 'object' || Array.isArray(target[key])) {
                                target[key] = {};
                            }
                            for (var key2 in arguments[i][key]) {
                                target[key][key2] = arguments[i][key][key2];
                            }
                            // extend(target[key], arguments[i][key]);  不要递归(无限),复制到第二层就好
                        } else {
                            target[key] = arguments[i][key];
                        }
                    }
                }
                return target;
            };
            /**
             * 拖动处理
             * create: 2017-06-12 13:41:28
             * update: 2017-06-21 15:22:18
             **/
            var dragHandlers = function() {
                var pAC = new parentAndChild();
                var scale = new scaleHandlers();
                var storage = _VariableStorage.dragHandlers = {};
                var down_handlers = function(displayable, event) {
                    if(storage.startDrag)return;
                    if (displayable.id && /scale_[1-8]/.test(displayable.id)) {
                        if (!/scale_[1-8]/.test(storage.displayable.id))
                            scale.displayable = storage.displayable;
                    } else {
                        scale.displayable = undefined;
                    }
                    storage.displayable = displayable;
                    if (!displayable.isDrag){
                        storage.displayable = undefined;
                        return;    
                    }

                    storage.startDrag = true;
                    storage.upX = event.offsetX;
                    storage.upY = event.offsetY;
                };
                var move_handlers = function(displayable, event) {
                    if (!storage.startDrag) return;

                    var x = event.offsetX - storage.upX;
                    var y = event.offsetY - storage.upY;
                    if (!_VariableStorage.snaplines_x || Math.abs(x) > 1 || /scale_[1-8]/.test(storage.displayable.id)) {
                        storage.upX = event.offsetX;
                    } else {
                        x = 0;
                    }
                    if (!_VariableStorage.snaplines_y || Math.abs(y) > 1 || /scale_[1-8]/.test(storage.displayable.id)) {
                        storage.upY = event.offsetY;
                    } else {
                        y = 0;
                    }
                    if (storage.displayable.id && /scale_[1-8]/.test(storage.displayable.id)) {
                        scale.drag(storage.displayable.id.replace(/scale_([1-8])/, '$1'), x, y);
                        snaplines(scale.displayable);
                    } else {
                        pAC.move(storage.displayable.dataIndex, x, y);
                        self.set(storage.displayable.dataIndex, {
                            x: self.DisplayList[storage.displayable.dataIndex].x + x,
                            y: self.DisplayList[storage.displayable.dataIndex].y + y
                        });
                        self.DisplayList.forEach(function(data){
                            if(data.borderStyle.selected && data.dataIndex != storage.displayable.dataIndex){
                                self.set(data.dataIndex, {
                                    x: data.x + x,
                                    y: data.y + y
                                });
                            }
                        });
                        snaplines(storage.displayable);
                    }
                };
                var up_handlers = function(displayable, event) {
                    storage.startDrag = false;
                    _VariableStorage.Snaplines.length = 0;
                    if (displayable) {
                        self.saveStatus();
                        scale.draw(scale.displayable || storage.displayable || displayable);
                    }
                    if (scale.displayable) {
                        storage.displayable = scale.displayable;
                        scale.draw(scale.displayable);
                        scale.displayable = undefined;
                    }
                };
                exports.dragHandlers = {
                    down_handlers: down_handlers,
                    up_handlers: up_handlers,
                    move_handlers: move_handlers
                };
            };
            /**
             * 对齐线
             * create：2017-06-21 15:23:01
             **/
            var snaplines = function(displayable) {
                _VariableStorage.Snaplines.length = 0;
                _VariableStorage.snaplines_x = false;
                _VariableStorage.snaplines_y = false;
                var list = self.DisplayList;
                var tmpx_1 = [displayable.x, displayable.x + displayable.borderStyle.width];
                var tmpy_1 = [displayable.y, displayable.y + displayable.borderStyle.height];
                for (var i = 13; i < list.length; i++) {
                    if(list[i] == undefined)continue;
                    if (displayable.dataIndex == list[i].dataIndex) continue;

                    var tmpx_2 = [list[i].x, list[i].x + list[i].borderStyle.width];
                    tmpx_1.forEach(function(value1) {
                        tmpx_2.forEach(function(value2) {
                            if (value1 == value2) {
                                _VariableStorage.snaplines_x = true;
                                addDrawList(value1, displayable.y, value2, list[i].y);
                            }
                        });
                    });

                    var tmpy_2 = [list[i].y, list[i].y + list[i].borderStyle.height];
                    tmpy_1.forEach(function(value1) {
                        tmpy_2.forEach(function(value2) {
                            if (value1 == value2) {
                                _VariableStorage.snaplines_y = true;
                                addDrawList(displayable.x, value1, list[i].x, value2);
                            }
                        });
                    });
                }

                function addDrawList(x1, y1, x2, y2) {
                    _VariableStorage.Snaplines.push({
                        type: 'line',
                        style: {
                            color: '#109cea',
                            lineWidth: 1
                        },
                        origin: {
                            x: x1,
                            y: y1,
                        },
                        end: {
                            x: x2,
                            y: y2
                        }
                    });
                }
            };
            /**
             * 父子控件处理
             * create: 2017-06-14 14:06:59
             **/
            var parentAndChild = function() {
                // var list = _VariableStorage.parentAndChildList = {};
                this.judge = function(displayable) {
                    var parent_displayable = findHover(displayable.x, displayable.y, function(tmp) {
                        if (!tmp || !tmp.isParent || tmp.dataIndex == displayable.dataIndex) return false;
                        return true;
                    });
                    if (displayable.dataIndex > 12 && parent_displayable && parent_displayable.isParent) {
                        var list = self.DisplayList[parent_displayable.dataIndex].childs;
                        // if (displayable.parentDataIndex == parent_displayable.dataIndex) {
                        //     return;
                        // }
                        // if (displayable.parentDataIndex != undefined) {
                        //     delete list[displayable.dataIndex];
                        // }
                        // displayable.parentDataIndex = parent_displayable.dataIndex;
                        // list[displayable.dataIndex] = displayable.id;

                        if (displayable.parentDataIndex != parent_displayable.dataIndex) {
                            if (displayable.parentDataIndex != undefined) {
                                delete self.DisplayList[displayable.parentDataIndex].childs[displayable.dataIndex];
                            }
                            displayable.parentDataIndex = parent_displayable.dataIndex;
                            list[displayable.dataIndex] = displayable.id;
                        }
                    } else {
                        if (displayable.parentDataIndex != undefined) {
                            delete self.DisplayList[displayable.parentDataIndex].childs[displayable.dataIndex];
                            displayable.parentDataIndex = undefined;
                        }
                    }
                };
                this.move = function(dataIndex, x, y) {
                    for (var i in self.DisplayList[dataIndex].childs) {
                        self.set(i, {
                            x: self.findById(self.DisplayList[dataIndex].childs[i]).x + x,
                            y: self.findById(self.DisplayList[dataIndex].childs[i]).y + y
                        }, false);
                    }
                };
            };
            /**
             * 缩放处理
             * create：2017-06-20 10:21:39
             * update: 2017-06-21 14:00:00
             **/
            var scaleHandlers = function() {
                var scale_width = 4;
                var init = function() {
                    for (var i = 1; i <= 8; i++) {
                        addToList({
                            type: 'rect',
                            id: 'scale_' + i,
                            borderStyle: { top: 1, bottom: 1, left: 1, right: 1, background: '#353535', width: scale_width, height: scale_width },
                            rect: getRect(0, 0, scale_width, scale_width),
                            zIndex: 999999999,
                            isDrag: true,
                            x: 0,
                            y: 0
                        });
                    }
                };
                this.hide = function() {
                    for (var i = 1; i <= 8; i++) {
                        var obj = findById('scale_' + i);
                        self.set(obj.dataIndex, {
                            isPrint: false
                        }, false);
                    }
                    self._updateQueue++;
                };
                this.draw = function(displayable) {
                    if (displayable.id && /scale_[1-8]/.test(displayable.id)) return;
                    if(/margin_top|margin_bottom|margin_left|margin_right|margin_centen/.test(displayable.id))return;
                    for (var i = 1; i <= 8; i++) {
                        var obj = findById('scale_' + i);
                        var x = displayable.x - scale_width / 2;
                        var y = displayable.y - scale_width / 2;
                        var width = displayable.borderStyle.width + scale_width;
                        var height = displayable.borderStyle.height + scale_width;
                        if (i < 4) {
                            var offset_x = width / 2 - scale_width / 2;
                            x += (i - 1) * offset_x;
                        } else if (i == 4 || i == 5) {
                            x += (i - 4) * displayable.borderStyle.width;
                            var offset_y = height / 2 - scale_width / 2;
                            y += offset_y;
                        } else {
                            var offset_x = width / 2 - scale_width / 2;
                            x += (i - 6) * offset_x;
                            y += displayable.borderStyle.height;
                        }
                        self.set(obj.dataIndex, {
                            x: x,
                            y: y,
                            isPrint: true
                        }, false);
                    }
                    self._updateQueue++;
                };
                var pAC = new parentAndChild();
                this.drag = function(index, offset_x, offset_y) {
                    var obj = findById(this.displayable.id);
                    if(/margin_top|margin_bottom|margin_left|margin_right|margin_centen/.test(obj.id))return;
                    if(obj.id == 'head' || obj.id == 'data_main' || obj.id == 'data_head' || obj.id == 'data_footer'){
                        if(index != 7){
                            return;
                        }
                        switch(obj.id){
                            case 'head':
                                var tmp = findById('data_head');
                                tmp.y += offset_y;
                                pAC.move(tmp.dataIndex, 0, offset_y);
                            case 'data_head':
                                var tmp = findById('data_main');
                                tmp.y += offset_y;
                                pAC.move(tmp.dataIndex, 0, offset_y);
                            case 'data_main':
                                var tmp = findById('data_footer');
                                tmp.y += offset_y;
                                pAC.move(tmp.dataIndex, 0, offset_y);
                        }
                    }
                    if(obj.id == 'footer' && index != 2){
                        return;
                    }
                    var x = obj.x,
                        y = obj.y,
                        w = obj.borderStyle.width,
                        h = obj.borderStyle.height;
                    switch (index) {
                        case '1':
                            w = w + offset_x * -1;
                            h = h + offset_y * -1;
                            x = x + offset_x;
                            y = y + offset_y;
                            break;
                        case '2':
                            h = h + offset_y * -1;
                            y = y + offset_y;
                            break;
                        case '3':
                            w = w + offset_x;
                            h = h + offset_y * -1;
                            y = y + offset_y;
                            break;
                        case '4':
                            w = w + offset_x * -1;
                            x = x + offset_x;
                            break;
                        case '5':
                            w = w + offset_x;
                            break;
                        case '6':
                            w = w + offset_x * -1;
                            h = h + offset_y;
                            x = x + offset_x;
                            y = y;
                            break;
                        case '7':
                            h = h + offset_y;
                            break;
                        case '8':
                            w = w + offset_x;
                            h = h + offset_y;
                            break;
                    }
                    if (obj.type == 'text') {
                        if (w < obj.borderStyle.width && w < obj.font_size) {
                            w = obj.font_size;
                            x = obj.x;
                        }
                        if (h < obj.font_size) {
                            h = obj.font_size;
                            y = obj.y;
                        }
                    }
                    self.set(this.displayable.dataIndex, {
                        borderStyle: {
                            width: w,
                            height: h
                        },
                        x: x,
                        y: y
                    }, false);
                    this.draw(this.displayable);
                    this.hide();
                }
                self.hideScale = this.hide;
                init();
            };
            /**
             * 撤销, 重做
             * create: 2017-06-22 09:49:51
             **/
            var ctrlZY = function() {
                self.saveStatus = function() {
                    var list = self.DisplayList;
                    var tmp = [];
                    for (var i = 0; i < list.length; i++) {
                        tmp[i] = {};
                        extend(tmp[i], list[i]);
                    }
                    History.data.length = History.index;
                    History.data[History.index] = tmp;
                    History.index++;
                };
                this.back = function() {
                    if (History.index <= 1) return false;
                    var tmp = History.data[History.index-- - 2];
                    self.DisplayList = [];
                    for (var i = 0; i < tmp.length; i++) {
                        self.DisplayList[i] = {};
                        extend(self.DisplayList[i], tmp[i]);
                        self.DisplayList[i].borderStyle.selected = false;
                    }
                    self._updateQueue++;
                };
                this.recovery = function() {
                    if (History.data.length <= History.index) return false;
                    var tmp = History.data[History.index++];
                    self.DisplayList = [];
                    for (var i = 0; i < tmp.length; i++) {
                        self.DisplayList[i] = {};
                        extend(self.DisplayList[i], tmp[i]);
                        self.DisplayList[i].borderStyle.selected = false;
                    }
                    self._updateQueue++;
                };
            };
            /**
             * 边距
             * create：2017-06-23 11:48:56
             **/
            var setMargin = function() {
                var init = function(){
                    var margin = self.config.margin;
                    if(!margin) return;
                    var top = {
                        type: 'rect',
                        borderStyle: {top:0,left:0,right:0,bottom:0,background:'#FFF',height:margin.top,width:self._dom.width},
                        id: 'margin_top',
                        zIndex: 9999999998,
                        x: -1,
                        y: -1
                    };
                    top.rect =getRect(0, 0, 0, 0);
                    var bottom = {
                        type: 'rect',
                        borderStyle: {top:0,left:0,right:0,bottom:0,background:'#FFF',height:margin.bottom,width:self._dom.width},
                        id: 'margin_bottom',
                        zIndex: 9999999998,
                        x: -1,
                        y: self._dom.height - margin.bottom + 1
                    };
                    bottom.rect =getRect(0, 0, 0, 0);
                    var left = {
                        type: 'rect',
                        borderStyle: {top:0,left:0,right:0,bottom:0,background:'#FFF',height:self._dom.height,width:margin.left+1},
                        id: 'margin_left',
                        zIndex: 9999999999,
                        x: -1,
                        y: -1
                    };
                    left.rect =getRect(0, 0, 0, 0);
                    var right = {
                        type: 'rect',
                        borderStyle: {top:0,left:0,right:0,bottom:0,background:'#FFF',height:self._dom.height,width:margin.right+1},
                        id: 'margin_right',
                        zIndex: 9999999999,
                        x: self._dom.width - margin.right,
                        y: 0
                    };
                    right.rect = getRect(0, 0, 0, 0);
                    var centen = {
                        type: 'rect',
                        borderStyle: {top:1,left:1,right:1,bottom:1,height: self._dom.height - margin.top - margin.bottom + 1, width: self._dom.width - margin.left - margin.right},
                        id: 'margin_centen',
                        zIndex: -9999999999,
                        x: margin.left,
                        y: margin.top
                    };
                    centen.rect = getRect(0, 0, 0, 0);
                    addToList(top);addToList(bottom);addToList(left);addToList(right);addToList(centen);
                    self._updateQueue++;
                };
                self.setMargin = function(params){
                    var params2 = {};
                    var tmp = null;
                    if(params.id == 'margin_top'){
                        params2 = {
                            borderStyle: {
                                height: params.value,
                                width: self._dom.width
                            }
                        };
                        tmp = {y: params.value - findById('margin_top').borderStyle.height};
                    }else if(params.id == 'margin_bottom'){
                        params2 = {
                            borderStyle: {
                                height: params.value,
                                width: self._dom.width
                            },
                            y: self._dom.height - params.value + 1
                        };
                    }else if(params.id == 'margin_left'){
                        params2 = {
                            borderStyle: {
                                width: params.value + 1,
                                height: self._dom.height
                            }
                        };
                        tmp = {x: params.value - (findById('margin_left').borderStyle.width - 1)};
                    }else if(params.id == 'margin_right'){
                        params2 = {
                            borderStyle: {
                                width: params.value + 1,
                                height: self._dom.height
                            },
                            x: self._dom.width - params.value,
                        };
                    }
                    self.set(findById(params.id).dataIndex, params2);
                    self.set(findById('margin_centen').dataIndex, {
                        borderStyle: {
                            height: self._dom.height - findById('margin_top').borderStyle.height - findById('margin_bottom').borderStyle.height + 1,
                            width: self._dom.width - findById('margin_left').borderStyle.width - findById('margin_right').borderStyle.width + 2
                        },
                        x: findById('margin_left').borderStyle.width - 1,
                        y: findById('margin_top').borderStyle.height
                    });
                    if(tmp){
                        for(var i = 13; i < self.DisplayList.length; i++){
                            if(tmp.x){
                                self.set(self.DisplayList[i].dataIndex, {
                                    x: self.DisplayList[i].x + tmp.x
                                });
                            }
                            if(tmp.y){
                                self.set(self.DisplayList[i].dataIndex, {
                                    y: self.DisplayList[i].y + tmp.y
                                });
                            }
                        }
                    }
                };
                init();
            };
            /**
             * 设置宽度 高度
             * create_time: 2017-08-01 09:14:40
             */
            var setWH = function(){
                self.setHeight = function(height){
                    self.config.height = height;
                    height = height * self.cmToDots;
                    self._dom.height = height;
                    self._updateQueue++;
                    //reMargin();
                }
                self.setWidth = function(width){
                    self.config.width = width;
                    width = width * self.cmToDots;
                    self._dom.width = width;
                    self._updateQueue++;
                    //reMargin();
                }
                function reMargin(){
                    self.setMargin({
                        id: 'margin_top',
                        value: findById('margin_top').borderStyle.height
                    });

                    self.setMargin({
                        id: 'margin_bottom',
                        value: findById('margin_bottom').borderStyle.height
                    });
                    self.setMargin({
                        id: 'margin_left',
                        value: findById('margin_left').borderStyle.width - 1
                    });
                    self.setMargin({
                        id: 'margin_right',
                        value: findById('margin_right').borderStyle.width - 1
                    });
                }
            }
            /**
             * 判断 给定路径 是否包含 点
             * 根据奇-偶规则 https://en.wikipedia.org/wiki/Even–odd_rule
             **/
            var contains = function(x, y, poly) {
                var c = false;
                for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
                    if ((poly[i].y > y) != (poly[j].y > y) &&
                        (x < (poly[j].x - poly[i].x) * (y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)) {
                        c = !c;
                    }
                }
                return c;
            };
            /**
             * 找到点击的对象
             * 2017-06-12 09:43:09
             **/
            var findHover = function(x, y, callback) {
                var list = self.DisplayList.concat();
                list.sort(function(a, b) {
                    return b.zIndex - a.zIndex;
                });
                for (var i = 0; i < list.length; i++) {
                    if (list[i] != undefined && contains(x, y, list[i].rect)) {
                        if (typeof callback == 'function' && !callback(list[i])) continue;
                        var res_params = extend({}, list[i]);
                        return res_params;
                    } else {
                        if (typeof callback == 'function' && !callback(null)) continue;
                    }
                }
                return null;
            };
            var findById = function(id, list) {
                if (!list) {
                    list = self.DisplayList;
                }
                for (var i = 0; i < list.length; i++) {
                    if (list[i] && list[i].id != undefined && list[i].id == id) {
                        return list[i];
                    }
                }
                return null;
            };
            if(self.config.Print_Mode == 'edit'){
                dragHandlers();
                setMargin();
                setWH();
            }

            exports.parentAndChild = parentAndChild;
            exports.findHover = findHover;
            exports.addToList = addToList;
            exports.getRect = getRect;
            exports.extend = extend;
            exports.findById = findById;
            exports.ctrlZY = ctrlZY;
        },



        /****************************************************************
         * 3 界面绘制
         * create：2017-06-12 17:10:14
         ****************************************************************/
        function(exports, require) {
            exports.className = '3.界面绘制';

            var getRect = require(2).getRect;
            var extend = require(2).extend;

            var draw = self._draw;
            // 执行函数, 使用 requestAnimationFrame 进行迭代
            var run = function() {
                function step() {
                    if (self._updateQueue) {
                        // console.time('ms');
                        update();
                        // console.timeEnd('ms');
                    }
                    requestAnimationFrame(step);
                }
                requestAnimationFrame(step);
            };
            /**
             * 通过处理xy坐标实现一个像素宽
             * create: 2017-06-13 09:28:52
             **/
            var xyHandlers = function(xy) {
                if (draw.lineWidth >= 1.5) return;
                xy.x = parseInt(xy.x) + 0.5;
                xy.y = parseInt(xy.y) + 0.5;
                return;
            };

            //界面清除
            var clean = function(){
                draw.clearRect(0, 0, self._dom.width, self._dom.height);
                draw.fillStyle = '#ffffff';
                draw.fillRect(0, 0, self._dom.width, self._dom.height);
            }

            // 界面更新
            var update = function() {
                clean();
                var list = self.DisplayList.concat();
                list.sort(function(a, b) {
                    return a.zIndex - b.zIndex;
                });
                for (var i = 0; i < list.length; i++) {
                    var displayable = list[i];
                    if (displayable == undefined || displayable.isPrint === false) continue;
                    switch (displayable.type) {
                        case 'text':
                            drawText(displayable);
                            break;
                        case 'rect':
                            drawRect(displayable);
                            break;
                        case 'icon':
                            drawImg(displayable);
                            break;
                        case 'barcode':
                        case 'qrcode':
                            if(self.config.Print_Mode == 'edit'){
                                drawRect(displayable);
                            }else {
                                drawQrBar(displayable);
                            }
                            break;
                    }
                    if(self.config.Print_Mode == 'edit' && displayable.borderStyle.selected){
                        drawSelect(displayable)
                    };
                }
                // 绘制对齐线
                for (var i = 0; i < _VariableStorage.Snaplines.length; i++) {
                    var displayable = _VariableStorage.Snaplines[i];
                    switch (displayable.type) {
                        case 'line':
                            drawLine(displayable);
                            break;
                    }
                }
                if (self._updateQueue > 2) self._updateQueue = 2;
                self._updateQueue--;
            };
            /**
             * 绘制文本
             * create: 2017-06-12 20:40:58
             * update: 2017-06-14 09:58:02
             **/
            var drawText = function(displayable) {

                displayable.width = self.measureText(displayable.text, displayable.font_size);
                displayable.rect = getRect(displayable.x, displayable.y, displayable.borderStyle.width, displayable.borderStyle.height);

                displayable = extend({}, displayable);
                var font = '';
                if (displayable.bold) font += 'bold ';
                if (displayable.oblique) font += 'oblique ';
                draw.font = font + displayable.font_size + 'px 宋体';

                if(self.config.Print_Mode != 'edit'){
                    var text_arr = self.subsection(displayable.text, displayable.font_size, displayable.borderStyle.width);
                    if(text_arr.length > 0)
                        displayable.borderStyle.height += (text_arr.length - 1) * displayable.font_size;
                }
                //绘制背景
                drawRect(displayable.x, displayable.y, displayable.borderStyle);
                //绘制边框
                drawBorder(displayable.x, displayable.y, displayable.borderStyle);
                
                // 绘制文本 坐标是左下角
                var font_size = displayable.font_size;
                draw.font = font + displayable.font_size + 'px 宋体';
                draw.fillStyle = displayable.color;
                if(self.config.Print_Mode != 'edit'){
                    for(var i = 0; i < text_arr.length; i++){
                        displayable.font_size = font_size * text_arr.length;
                        displayable.width = self.measureText(text_arr[i], font_size);
                        draw.fillText(text_arr[i], align(displayable), valign(displayable) + font_size * (i+1));
                    }
                }else {
                    var text = displayable.text;
                    if(self.measureText(text, displayable.font_size) > displayable.borderStyle.width){
                        text = self.substr(text, displayable.font_size, displayable.borderStyle.width - self.measureText('..', displayable.font_size)) + '..';
                    }
                    displayable.width = self.measureText(text, displayable.font_size);
                    draw.fillText(text, align(displayable), valign(displayable) + displayable.font_size);
                }
                if (displayable.simple || self.config.Print_Mode != 'edit') {
                    return;
                }
                var x = displayable.x;
                var y = displayable.y;
                var borderWidth = displayable.borderStyle.width;
                var borderheight = displayable.borderStyle.height;
                var size = 2;
                //绘制文本框 四个角
                drawLine({ x: x, y: y }, { x: x + size, y: y });
                drawLine({ x: x + borderWidth - size, y: y }, { x: x + borderWidth, y: y });
                drawLine({ x: x + borderWidth, y: y }, { x: x + borderWidth, y: y + size });
                drawLine({ x: x + borderWidth, y: y + borderheight - size }, { x: x + borderWidth, y: y + borderheight });
                drawLine({ x: x + borderWidth, y: y + borderheight }, { x: x + borderWidth - size, y: y + borderheight });
                drawLine({ x: x + size, y: y + borderheight }, { x: x, y: y + borderheight });
                drawLine({ x: x, y: y + borderheight }, { x: x, y: y + borderheight - size });
                drawLine({ x: x, y: y + size }, { x: x, y: y });
                //水平对齐方式
                function align(displayable) {
                    switch (displayable.align) {
                        case 'left':
                            return displayable.x;
                        case 'centen':
                            return displayable.x + (displayable.borderStyle.width - displayable.width) / 2;
                        case 'right':
                            return displayable.x + (displayable.borderStyle.width - displayable.width);
                        default:
                            return displayable.x;
                    }
                }

                function valign(displayable) {
                    switch (displayable.valign) {
                        case 'top':
                            return displayable.y - 3;
                        case 'centen':
                            return displayable.y + (displayable.borderStyle.height - displayable.font_size) / 2 - 3;
                        case 'bottom':
                            return displayable.y + (displayable.borderStyle.height - displayable.font_size) - 3;
                        default:
                            return displayable.y - 3;
                    }
                }
            };
            /**
             * 绘制边框
             * create: 2017-06-12 21:25:20
             **/
            var drawBorder = function(x, y, style) {
                if (typeof x == 'object') {
                    style = x.borderStyle;
                    y = x.y;
                    x = x.x;
                }
                if(style.selected){
                    return;
                }
                var width = style.width;
                var height = style.height;
                style.top && drawLine({ x: x, y: y }, { x: x + width, y: y }, { lineWidth: style.top });
                style.right && drawLine({ x: x + width, y: y }, { x: x + width, y: y + height }, { lineWidth: style.right });
                style.bottom && drawLine({ x: x + width, y: y + height }, { x: x, y: y + height }, { lineWidth: style.bottom });
                style.left && drawLine({ x: x, y: y + height }, { x: x, y: y }, { lineWidth: style.left });
            };
            /**
             * 绘制线条
             * create：2017-06-13 10:44:26
             **/
            var drawLine = function(origin, end, style) {
                if (typeof origin == 'object' && end == undefined) {
                    style = origin.style;
                    end = origin.end;
                    origin = origin.origin;
                }
                style = style ? style : {};
                draw.lineWidth = style.lineWidth ? parseFloat(style.lineWidth) : 1;
                draw.strokeStyle = style.color ? style.color : '#000'
                xyHandlers(origin);
                xyHandlers(end);
                if(style.lineDesh){
                    draw.setLineDash([3,2]);
                }else {
                    draw.setLineDash([1,0]);
                }
                draw.beginPath();
                draw.moveTo(origin.x, origin.y);
                draw.lineTo(end.x, end.y);
                draw.stroke();
                draw.closePath();
            };
            /**
             * 绘制矩形(色块)
             * create: 2017-06-14 09:29:18
             **/
            var drawRect = function(x, y, style) {
                var border = false;
                var displayable = {};
                if (typeof x == 'object') {
                    displayable = x;
                    style = x.borderStyle;
                    y = x.y;
                    x = x.x;
                    border = true;
                }
                var xy = { x: x, y: y };
                xyHandlers(xy);
                draw.fillStyle = style.background ? style.background : 'rgba(255,255,255,0)';
                var width = style.width;
                var height = style.height;
                draw.fillRect(xy.x, xy.y, width, height);
                if (typeof displayable.title == 'object') {
                    drawRect(xy.x, xy.y, {
                        background: 'rgba(227,227,227,0.6)',
                        width: style.width,
                        height: 20
                    })
                    draw.font = 'bold 16px 宋体';
                    draw.fillStyle = '#000';
                    draw.fillText(displayable.title.text, xy.x, xy.y + 16);
                }
                border && drawBorder(x, y, style);
            };
            /**
             * 绘制图片
             **/
            var drawImg = function(displayable) {
                if (!displayable.borderStyle.img && self.config.Print_Mode == 'edit') {
                    var img = new Image();
                    img.src = displayable.dataUrl;
                    img.onload = function() {
                        displayable.borderStyle.img = img;
                        draw.drawImage(img, displayable.x, displayable.y, displayable.borderStyle.width, displayable.borderStyle.height);
                    };
                } else {
                    draw.drawImage(displayable.borderStyle.img, displayable.x, displayable.y, displayable.borderStyle.width, displayable.borderStyle.height);
                }
                drawBorder(displayable.x, displayable.y, displayable.borderStyle);
            }
            /**
             * 绘制二维码'PT380/UB144BL'
             **/
            var drawQrBar = function(displayable) {
                // var img = new Image();
                // img.onload = function(){
                //     var height = (displayable.font_size ? displayable.font_size / 2 : 0) + displayable.borderStyle.height;
                    draw.drawImage(displayable.borderStyle.img, displayable.x, displayable.y, displayable.borderStyle.width, displayable.borderStyle.height);
                // }
                // if(displayable.type == 'qrcode'){
                //     var div = document.createElement('div');
                //     var qrcode2 = new QRCode(div, {
                //         text: displayable.text,
                //         width : displayable.borderStyle.width,
                //         height : displayable.borderStyle.height
                //     });
                //     img.src = div.children[0].toDataURL();
                // }else {
                //     JsBarcode(img)
                //       .CODE128(displayable.text, {
                //         fontSize: displayable.font_size, 
                //         height: displayable.borderStyle.height, 
                //         textMargin: 0,
                //         margin: 0
                //       }).render();
                // }
            }

            var drawSelect = function(displayable){
                var width = displayable.borderStyle.width;
                var height = displayable.borderStyle.height;
                var x = displayable.x;
                var y = displayable.y;
                var style = {
                    lineDesh: true,
                    color: '#3c77d0',
                    lineWidth: 1.3
                };
                drawLine({ x: x , y: y}, { x: x + width, y: y}, style);
                drawLine({ x: x + width, y: y}, { x: x + width, y: y + height}, style);
                drawLine({ x: x + width , y: y + height}, { x: x, y: y + height}, style);
                drawLine({ x: x , y: y + height}, { x: x, y: y}, style);
            }

            //如果是编辑模式
            if(self.config.Print_Mode == 'edit'){
                run();
            }else {
                self._update = update;
            }
        }
    ];
    init.call(this);
}
