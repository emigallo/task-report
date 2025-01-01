"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CURRENT_SPRINT = '5d6971fd91e25d36ded88e39';
function run() {
    readFile();
}
function readFile() {
    fetch('./files/6CQD42Sy - ghz-prep.json')
        .then(function (response) { return response.json(); })
        .then(function (data) { return doSomething(JSON.stringify(data)); });
}
function doSomething(json) {
    var b = safeJsonParse(json);
    var board = new Board();
    // board = (<Board>JSON.parse(json));
    // board.cards = board.cards;
    // board.actions = board.actions;
    // console.log(board);
    // let result: Card[] = b.cards.filter(x => x.idList === CURRENT_SPRINT && !x.closed);
    // let result = board.getFullCard('67584c4ec4630bebea896ac4');
    // console.log(result);
}
run();
var safeJsonParse = function (str) {
    var jsonValue = JSON.parse(str);
    return jsonValue;
};
var Board = /** @class */ (function () {
    function Board() {
    }
    // actions: Action[];
    Board.prototype.getFullCard = function (cardId) {
        var rett;
        rett = this.cards.filter(function (x) { return x.id === cardId; })[0];
        // rett.action = this.actions.filter(x => x.id === cardId)[0];
        return rett;
    };
    return Board;
}());
exports.default = Board;
var Card = /** @class */ (function () {
    function Card() {
    }
    return Card;
}());
exports.default = Card;
