/*
 * @Author: 萌新王
 * @Date: 2023-09-15 15:10:28
 * @LastEditors: 萌新王
 * @LastEditTime: 2023-09-18 16:44:09
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
                _func(j, i);
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
    getGridItem: function (x, y=null) {
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
        /**@type {cc.Point} 玩家当前位置 */
        var oldPos = this.pos;
        oldPos = {
            x: oldPos.x + pos.x,
            y: oldPos.y + pos.y,
        };
        var go1 = this.isGo(oldPos.x, oldPos.y)
        if (go1) {
            var node1 = this.getGridItem(oldPos.x, oldPos.y)
            //玩家正常走
            if (this.isWhat(node1) != "□") {
                this.road(this.pos);
                this.player(oldPos);
                //推箱子
            } else {
                var pos2 = oldPos;
                pos2.x += pos.x;
                pos2.y += pos.y;
                var go2 = this.isGo(pos2.x, pos2.y)
                if (go2) {
                    this.road(this.pos);
                    this.player(oldPos);
                    this.box(pos2);
                }
            }
        }
    },
    /**障碍
     * @param {Number} x 
     * @param {Number} y 
     */
    zoc: function (x, y=null) {
        if (y == null) {
            y = x.y;
            x = x.x;
        };
        var node = this.getGridItem(x, y);
        node.setString("×");
        //红色字体
        node.setFontFillColor(new cc.Color(255, 0, 0, 0))
        node._tag = "×";
    },
    /**箱子
     * @param {Number} x 
     * @param {Number} y 
     */
    box: function (x, y=null) {
        if (y == null) {
            y = x.y;
            x = x.x;
        };
        var node = this.getGridItem(x, y);
        node.setString("□");
        //深棕色字体
        node.setFontFillColor(new cc.Color(99, 64, 66, 0))
        node._tag = "□";
    },
    /**玩家
     * @param {Number} x 
     * @param {Number} y 
     */
    player: function (x, y=null) {
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
    },
    /**目标点
     * @param {Number} x 
     * @param {Number} y 
     */
    target: function (x, y=null) {
        if (y == null) {
            y = x.y;
            x = x.x;
        };
        var node = this.getGridItem(x, y);
        node.setString("z");
        //黄色字体
        node.setFontFillColor(new cc.Color(255, 255, 0, 0))
        node._tag = "Z";
    },
    /**道路
     * @param {Number} x 
     * @param {Number} y 
     */
    road: function (x, y=null) {
        if (y == null) {
            y = x.y;
            x = x.x;
        };
        var node = this.getGridItem(x, y);
        node.setString("·");
        //绿色字体
        node.setFontFillColor(new cc.Color(0, 255, 0, 0))
        node._tag = "·";
    },
    isGo: function (x, y=null) {
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
    isWhat: function (node) {
        return node._tag
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