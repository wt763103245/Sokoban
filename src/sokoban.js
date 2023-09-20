/*
 * @Author: 萌新王
 * @Date: 2023-09-15 15:10:28
 * @LastEditors: 萌新王
 * @LastEditTime: 2023-09-20 15:24:05
 * @FilePath: \Sokoban\src\sokoban.js
 * @Email: 763103245@qq.com
 */
/**游戏层 */
var GamePlayLayer = cc.Layer.extend({
    /**@type {Array[Array[cc.Node]]} 游戏网格 */
    grid: null,
    /**@type {cc.Node} 玩家节点 */
    _player: null,
    /**@type {cc.Size} 游戏界面大小 */
    winSize: { width: 0, height: 0 },
    /**@type {Array[Array[String]]|Config.Level[0]} 当前游戏地图 */
    Map: null,
    /**@type {cc.Point} 玩家当前位置 */
    pos: null,
    ctor: function () {
        this._super();
        /**@type {cc.Size} 当前界面大小 */
        this.winSize = cc.winSize;
        /**得到初始游戏地图数据 */
        this.Map = Config.Level[0];
        //初始背景
        this.initBackground();
        //初始控制逻辑
        this.initControl();
    },
    /**初始化背景 */
    initBackground: function () {
        //初始化网格
        this.initGrid();
    },
    /**初始化网格 */
    initGrid: function () {
        /**@type {cc.Node} 网格节点 */
        var grid = this.grid = new cc.Node();
        /**@type {cc.Size} 屏幕大小 */
        var winSize = this.winSize;
        /**@type {Number} 屏幕宽度 */
        var winWidth = winSize.width;
        /**@type {Number} 屏幕高度 */
        var winHeight = winSize.height;
        //居中
        //锚点0.5，0.5
        grid.setAnchorPoint(0.5, 0.5);
        //位置屏幕中间
        grid.setPosition(winWidth / 2, winHeight / 2);
        /**网格大小 */
        var _size = Config.Grid.Size;
        /**@type {Number} 网格宽度 */
        var _maxX = _size.x;
        /**@type {Number} 网格高度 */
        var _maxY = _size.y;
        //高宽，宽度80%
        // var gridWidth = winWidth * 0.8
        //每格20像素高宽
        var gridWidth = 20 * _maxX;
        var gridHeight = 20 * _maxY;
        //设置大小
        grid.setContentSize(gridWidth, gridHeight);
        //每格间隔
        var _width = gridWidth / _maxX;
        var _height = gridHeight / _maxY;
        /**当前地图 */
        var map = this.Map;
        /**类型对应方法 */
        var mapFunc = {
            "×": this.zoc,
            "□": this.box,
            "△": this.player,
            "Z": this.target,
            "·": this.road,
        };
        //初始化网格数据
        grid._grid = []
        //循环网格，循环y轴数据
        for (var i = 0; i < _maxX; i++) {
            /**@type {Number} 当前节点位置y */
            var y = i * _height;
            /**@type {Array} 网格数组 */
            var gridListX = grid._grid;
            /**初始化x轴节点数据 */
            var gridListY = []
            //添加到网格数据中
            gridListX.push(gridListY)
            //循环网格，循环x轴数据
            for (var j = 0; j < _maxY; j++) {
                /**@type {Number} 当前节点位置x */
                var x = j * _width;
                /**@type {cc.LabelTTF} 创建一个文本节点，文本内容为"×"，字体为Arial，字号为38 */
                var _node = new cc.LabelTTF("×", "Arial", 38);
                //设置这个节点的位置
                _node.setPosition(x, y);
                //添加到grid节点中
                grid.addChild(_node)
                //添加到grid节点的缓存中，用来获取
                gridListY.push(_node);
                /**当前位置类型 */
                var type = map[i][j]
                /**类型对应方法 */
                var _func = mapFunc[type].bind(this)
                //设定当前位置的样式
                _func(j, i, true);
            };
        };
        // 将网格添加到场景中
        this.addChild(grid);
    },
    /**得到网格中的节点
     * @param {Number} x 位置x
     * @param {Number} y 位置y
     * @returns {cc.Node} 网格中的节点
     */
    getGridItem: function (x, y = null) {
        if (y == null) {
            y = x.y;
            x = x.x;
        };
        return this.grid._grid[y][x]
    },
    /**初始化控制 */
    initControl: function () {
        //监听键盘
        this.keyBoardListener();
    },
    /**@type {{Number: String}} 键盘按键编码对应方法 类型字符串 */
    keyCodeDict: {
        //wsad
        87: 'w',
        83: 's',
        65: 'a',
        68: 'd',
        //上下左右
        38: 'w',
        40: 's',
        37: 'a',
        39: 'd',
    },
    /**监听键盘按键 */
    keyBoardListener: function () {
        //创建事件监听
        var listener = cc.EventListener.create({
            //键盘监听
            event: cc.EventListener.KEYBOARD,
            //吞掉其他监听，相当于全局监听，其他监听键盘事件将会没有响应，如果优先级比这个低的话
            swallowTouches: true,
            //监听按键，并绑定方法中this为当前类
            onKeyPressed: function (keyCode, event) {
                /**@type {{Number: String}} 按键编码对应方法类型字符串 */
                let data = this.keyCodeDict;
                //判断对应按键是否有对应的方法
                if (keyCode in data) {
                    /**@type {String} 获得当前按键的方法类型字符串 */
                    let key = data[keyCode];
                    /**@type {{String: Function}} 方法类型字符串对应其方法 */
                    data = {
                        'w': this.top,
                        's': this.down,
                        'a': this.left,
                        'd': this.right,
                    };
                    //方法类型字符串是否有对应的方法
                    if (key in data) {
                        /**准备执行的方法，并绑定this为当前类 */
                        var func = data[key].bind(this);
                        //执行对应方法
                        func();
                    };
                }
            }.bind(this);
        });
        //将上面创建的监听添加到事件管理器中
        cc.eventManager.addListener(listener, this);
    },
    /**向上移动 */
    top: function () {
        this.move(this._player, 0, 1);
    },
    /**向下移动 */
    down: function () {
        this.move(this._player, 0, -1);
    },
    /**向左移动 */
    left: function () {
        this.move(this._player, -1, 0);
    },
    /**向右移动 */
    right: function () {
        this.move(this._player, 1, 0);
    },
    /**障碍
     * @param {Number} x 
     * @param {Number} y 
     */
    zoc: function (x, y = null, init = false) {
        //适配cc.Point
        if (y == null) {
            y = x.y;
            x = x.x;
        };
        /**获得当前节点 */
        var node = this.getGridItem(x, y);
        //设置当前节点文本内容为"x"
        node.setString("×");
        //红色字体
        node.setFontFillColor(new cc.Color(255, 0, 0, 0))
        /**@type {String|Config.NodeType} 标记当前节点为 不可通行 */
        node._tag = "×";
        /**@type {cc.Point} 保存当前节点的位置到缓存中 */
        node._pos = { "x": x, "y": y };
        //初始化时设定固定数据
        if (init) {
            /**经过过后的类型 */
            node._oldType = node._tag;
            /**@type {Boolean} 不可通过 */
            node._assable = false;
            /**@type {Boolean} 不可移动 */
            node._mobile = false;
        };
    },
    /**箱子
     * @param {Number} x 
     * @param {Number} y 
     */
    box: function (x, y = null, init = false) {
        if (y == null) {
            y = x.y;
            x = x.x;
        };
        var node = this.getGridItem(x, y);
        node.setString("□");
        //深棕色字体
        node.setFontFillColor(new cc.Color(99, 64, 66, 0))
        node._tag = "□";
        node._pos = { "x": x, "y": y };
        /**@type {Boolean} 可移动 */
        node._mobile = true;
        if (init) {
            /**经过过后的类型 */
            node._oldType = Config.NodeType.road;
            /**@type {Boolean} 可通过 */
            node._assable = true;
        }
    },
    /**玩家
     * @param {Number} x 
     * @param {Number} y 
     */
    player: function (x, y = null, init = false) {
        if (y == null) {
            y = x.y;
            x = x.x;
        };
        var node = this.getGridItem(x, y);
        node.setString("△");
        //蓝色字体
        node.setFontFillColor(new cc.Color(0, 0, 255, 0))
        node._tag = "△";
        this._player = node;
        /**保存玩家当前位置到游戏缓存中 */
        this.pos = { "x": x, "y": y };
        node._pos = { "x": x, "y": y };
        if (init) {
            /**经过过后的类型 */
            node._oldType = Config.NodeType.road;
            /**@type {Boolean} 可通过 */
            node._assable = true;
            /**@type {Boolean} 可移动 */
            node._mobile = true;
        };
    },
    /**目标点
     * @param {Number} x 
     * @param {Number} y 
     */
    target: function (x, y = null, init = false) {
        if (y == null) {
            y = x.y;
            x = x.x;
        };
        var node = this.getGridItem(x, y);
        node.setString("z");
        //黄色字体
        node.setFontFillColor(new cc.Color(255, 255, 0, 0))
        node._tag = "Z";
        node._pos = { "x": x, "y": y };
        if (init) {
            /**经过过后的类型 */
            node._oldType = node._tag;
            /**@type {Boolean} 可通过 */
            node._assable = true;
            /**@type {Boolean} 不可移动 */
            node._mobile = false;
        };
    },
    /**道路
     * @param {Number} x 
     * @param {Number} y 
     */
    road: function (x, y = null, init = false) {
        if (y == null) {
            y = x.y;
            x = x.x;
        };
        var node = this.getGridItem(x, y);
        node.setString("·");
        //绿色字体
        node.setFontFillColor(new cc.Color(0, 255, 0, 0))
        node._tag = "·";
        node._pos = { "x": x, "y": y };
        /**@type {Boolean} 不可移动 */
        node._mobile = false;
        if (init) {
            /**经过过后的类型 */
            node._oldType = node._tag;
            /**@type {Boolean} 可通过 */
            node._assable = true;
        };
    },
    /**得到当前节点移动过后应该表现的类型
     * @param {*} node 当前节点
     * @returns {Config.NodeType}
     */
    getMovementType: function (node) {
        return node._oldType;
    },
    /**得到当前节点的类型
     * @param {*} node 当前节点
     * @returns {String} 当前节点类型
     */
    getNodeType: function (node) {
        return node._tag;
    },
    /**移动到
     * @param {cc.Node} node 
     * @param {Number|cc.Point} x 
     * @param {Number} y 
     * @returns {Boolean} 是否移动了
     */
    move: function (node, x, y = null) {
        //适配cc.Point
        if (y == null) {
            y = x.y;
            x = x.x;
        };
        /**@type {cc.Point} 获得当前节点的位置 */
        var oldPos = node._pos;
        /**@type {cc.Point} 当前节点如果移动后的位置 */
        var newPos = {
            x: oldPos.x + x,
            y: oldPos.y + y,
        };
        /**新位置当前的节点 */
        var newNode = this.getGridItem(newPos);
        //新位置可以通过
        if (newNode._assable) {
            //新位置的节点是否可以移动
            if (newNode._mobile) {
                //尝试移动新位置的节点，如果不能移动则全部都不能移动
                if (!this.move(newNode, x, y)) return false;
            };
            /**@type {String|Config.NodeType} 当前位置节点移动过后的类型 */
            var oldType = this.getMovementType(node);
            /**@type {String|Config.NodeType} 当前位置节点的类型 */
            var newType = this.getNodeType(node);
            /**@type {{String|Config.NodeType: Function}} 位置类型对应其设定方法 */
            var mapFunc = {
                "×": this.zoc,
                "□": this.box,
                "△": this.player,
                "Z": this.target,
                "·": this.road,
            };
            /**@type {Function} 旧位置变成对应类型的方法 */
            var oldFunc = mapFunc[oldType].bind(this);
            //旧位置变为对应类型。可以理解为玩家走过的位置变成路
            oldFunc(oldPos);
            /**@type {Function} 新位置变成对应类型的方法 */
            var newFunc = mapFunc[newType].bind(this);
            //新位置变为对应类型。可以理解为玩家当前走到的位置变成玩家
            newFunc(newPos);
            //移动过
            return true;
        }
        //不能移动当前节点
        return false;
    },
})
/**添加游戏场景 */
var GamePlayScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        /**@type {cc.Layer} 游戏层 */
        var layer = new GamePlayLayer();
        this.addChild(layer);
    }
});