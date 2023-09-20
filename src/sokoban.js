/*
 * @Author: 萌新王
 * @Date: 2023-09-15 15:10:28
 * @LastEditors: 萌新王
 * @LastEditTime: 2023-09-20 14:48:42
 * @FilePath: \Sokoban\src\sokoban.js
 * @Email: 763103245@qq.com
 */
/**游戏层 */
var GamePlayLayer = cc.Layer.extend({
    grid: null,
    _player: null,
    winSize: { width: 0, height: 0 },
    Map: null,
    pos: null,
    ctor: function () {
        this._super();
        this.winSize = cc.winSize;
        this.Map = Config.Level[0];
        this.initBackground();
        this.initControl();
    },
    initBackground: function () {
        this.initGrid();
    },
    initGrid: function () {
        /**@type {cc.Node} 网格节点 */
        var grid = this.grid = new cc.Node();
        /**@type {cc.Size} 屏幕大小 */
        var winSize = this.winSize;
        var winWidth = winSize.width;
        var winHeight = winSize.height;
        //居中
        //锚点0.5，0.5
        grid.setAnchorPoint(0.5, 0.5);
        //位置屏幕中间
        grid.setPosition(winWidth / 2, winHeight / 2);
        /**网格大小 */
        var _size = Config.Grid.Size;
        var _maxX = _size.x;
        var _maxY = _size.y;
        //高宽，宽度80%
        // var gridWidth = winWidth * 0.8
        var gridWidth = 20 * _maxX
        var gridHeight = 20 * _maxY
        grid.setContentSize(gridWidth, gridHeight);
        var _width = gridWidth / _maxX
        var _height = gridHeight / _maxY
        /**当前地图 */
        var map = this.Map;
        /**类型对应方法 */
        var mapFunc = {
            "×": this.zoc,
            "□": this.box,
            "△": this.player,
            "Z": this.target,
            "·": this.road,
        }
        //循环网格
        for (var i = 0; i < _maxX; i++) {
            var y = i * _height;
            if (!grid._grid) grid._grid = []
            /**@type {Array} 网格数组 */
            var gridListX = grid._grid;
            var gridListY = []
            gridListX.push(gridListY)
            for (var j = 0; j < _maxY; j++) {
                var x = j * _width;
                var _node = new cc.LabelTTF("×", "Arial", 38);
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
    initControl: function () {
        // var player = this.player = new cc.LabelTTF("△", "Arial", 38);
        // // // 位置
        // // player.x = size.width / 2;
        // // player.y = size.height / 2;
        // // 添加到网格中
        // this.grid.addChild(player);

        //监听键盘
        this.keyBoardListener();
    },
    keyCodeDict: {
        87: 'w',
        83: 's',
        65: 'a',
        68: 'd',
        38: 'w',
        40: 's',
        37: 'a',
        39: 'd',
    },
    keyBoardListener: function () {
        var listener = cc.EventListener.create({
            //键盘监听
            event: cc.EventListener.KEYBOARD,
            //吞掉其他监听
            swallowTouches: true,

            onKeyPressed: function (keyCode, event) {
                let data = this.keyCodeDict
                if (keyCode in data) {
                    let key = data[keyCode]
                    data = {
                        'w': this.top,
                        's': this.down,
                        'a': this.left,
                        'd': this.right,
                    }
                    if (key in data) {
                        var func = data[key].bind(this);
                        func();
                    };
                }
            }.bind(this)
        });
        cc.eventManager.addListener(listener, this);
    },
    top: function () {
        this.AddPos({ x: 0, y: 1 });
    },
    down: function () {
        this.AddPos({ x: 0, y: -1 });
    },
    left: function () {
        this.AddPos({ x: -1, y: 0 });
    },
    right: function () {
        this.AddPos({ x: 1, y: 0 });
    },
    /**
     * @param {cc.Point|{x: Number, y: Number}} pos 
     */
    AddPos: function (pos) {
        this.move(this._player, pos);
    },
    /**障碍
     * @param {Number} x 
     * @param {Number} y 
     */
    zoc: function (x, y = null, init = false) {
        if (y == null) {
            y = x.y;
            x = x.x;
        };
        var node = this.getGridItem(x, y);
        node.setString("×");
        //红色字体
        node.setFontFillColor(new cc.Color(255, 0, 0, 0))
        node._tag = "×";
        node._pos = { "x": x, "y": y };
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
    isGo: function (x, y = null) {
        if (y == null) {
            y = x.y;
            x = x.x;
        };
        if (x >= 0 && y >= 0) {
            /**@type {Array[]} */
            var map = this.Map;
            if (y < map.length) {
                var pos = map[y]
                if (x < pos.length) return ["□", "·"].includes(this.isWhat(this.getGridItem(x, y)));
            }
        }
        return false;
    },
    /**得到当前节点移动过后应该表现的类型
     * @param {*} node 当前节点
     * @returns {Config.NodeType}
     */
    getMovementType: function (node) {
        return node._oldType;
    },
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
        if (y == null) {
            y = x.y;
            x = x.x;
        };
        var oldPos = node._pos;
        var newPos = {
            x: oldPos.x + x,
            y: oldPos.y + y,
        };
        /**新位置当前的节点 */
        var newNode = this.getGridItem(newPos);
        //新位置可以通过
        if (newNode._assable) {
            //新位置可以移动
            if (newNode._mobile) {
                if (!this.move(newNode, x, y)) return false;
            };
            /**位置类型 */
            var oldType = this.getMovementType(node);
            var newType = this.getNodeType(node);
            var mapFunc = {
                "×": this.zoc,
                "□": this.box,
                "△": this.player,
                "Z": this.target,
                "·": this.road,
            };
            var oldFunc = mapFunc[oldType].bind(this);
            oldFunc(oldPos);
            var newFunc = mapFunc[newType].bind(this);
            newFunc(newPos);
            //移动过的位置
            return true;
        }
        return false;
    },
})
/**添加游戏场景 */
var GamePlayScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new GamePlayLayer();
        this.addChild(layer);
    }
});