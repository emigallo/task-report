const CURRENT_SPRINT = '5d6971fd91e25d36ded88e39';

function readFile() {
    fetch('./files/6CQD42Sy - ghz-prep.json')
        .then(function (response) { return response.json(); })
        .then(function (data) { return loadBoard(JSON.stringify(data)); });
}

function loadBoard(json) {
    let result = JSON.parse(json);
    let board = new Board(result.id);
    board.addList(CURRENT_SPRINT, 'Sprint Actual');

    // filter(x => x.id == '6723c5667538610237410acd')

    result.cards.forEach(card => {
        board.addCard(card);
    });

    result.actions.forEach(action => {
        if (action.data.card) {
            board.addActionToCard(action, action.data.card.id);
        }
    });
    this.render(board);
}

function render(board) {
    let container = document.getElementById('container');
    board.cards.forEach(card => this.renderCard(container, card));
}

function renderCard(container, card) {
    let cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.innerHTML = card.name;

    let actionElement = document.createElement('div');
    actionElement.className = 'action';

    if (card.pluginData) {
        actionElement.innerHTML = `Estimado: ${card.pluginData.estimated} - Real: ${card.pluginData.real}`;
        cardElement.appendChild(actionElement);
    }

    container.appendChild(cardElement);
}

class Board {
    constructor(id) {
        this.id = id;
    }
    id;
    list = [];

    addList(id, name) {
        this.list.push(new BoardList(id, name));
    }

    getList(id) {
        this.list.filter(x => x.id == id)[0];
    }

    addCard(listId, card) {
        this.getList(listId).addCard(new Card(card));
    }
}

class BoardList {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }

    id;
    name;
    cards = [];

    addCard(card) {
        this.cards.push(new Card(card));
    }

    addActionToCard(action, cardId) {
        if (action && this.existsCard(cardId)) {
            this.cards.filter(x => x.id = cardId)[0].action = new Action(action);
        }
    }

    existsCard(cardId) {
        return this.cards.filter(x => x.id === cardId).length > 0;
    }

    getActiveCards() {
        return this.cards.filter(x => !x.closed);
    }
}

class Card {
    constructor(cardJson) {
        this.id = cardJson.id;
        this.name = cardJson.name;
        this.idList = cardJson.idList;
        this.closed = cardJson.closed;
        if (cardJson.pluginData) {
            cardJson.pluginData.forEach(element => {
                this.pluginData = new pluginData(element);
            });
        }
    }

    id;
    name;
    idList;
    closed;
    action;
    idShort;
    pluginData = [];
}

class Action {
    constructor(actionJson) {
        this.id = actionJson.id;
        this.data = new ActionData(actionJson.data);
    }

    id;
    data;
}

class ActionData {
    constructor(actionDataJson) {
        this.card = new Card(actionDataJson.card);
    }
    card;
}

class pluginData {
    constructor(pluginDataJson) {
        this.id = pluginDataJson.id;
        this.idPlugin = pluginDataJson.idPlugin;
        this.scope = pluginDataJson.scope;
        this.idModel = pluginDataJson.idModel;
        if (pluginDataJson.value) {
            let value = JSON.parse(pluginDataJson.value.replace('PU_ANY_FIELDS-badges', 'pUAnyFieldsBadges'));
            this.value = value.pUAnyFieldsBadges[0].v;
            this.estimated = this.value.split('-')[0];
            this.real = this.value.split('-')[1];
        }
        this.dateLastUpdated = pluginDataJson.dateLastUpdated;
    }

    id;
    idPlugin;
    scope;
    idModel;
    value;
    estimated;
    real;
    dateLastUpdated;
}

readFile();