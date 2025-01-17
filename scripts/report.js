const CURRENT_SPRINT = { name: 'Sprint Actual', id: '5d6971fd91e25d36ded88e39' };
const DEV = { name: 'En desarrollo', id: '5d6971fd91e25d36ded88e3c' };
const TEST = { name: 'En test', id: '5d6971fd91e25d36ded88e3d' };
const PROD = { name: 'En producción', id: '5d9b5806a59aab25d1528b90' };
const LIST = [CURRENT_SPRINT, DEV, TEST, PROD];


function readTrello(board, callback) {

    let opts = {
        type: 'redirect',
        name: 'Trello',
        persist: true,
        interactive: true,
        expiration: 'never',
        scope: { read: true, account: true },
        success: function (s) { console.log('success:' + s); },
        error: function (e) { console.log('error:' + e); },
        return_url: window.location
    };
    Trello.authorize(opts);
    Trello.get('/boards/6CQD42Sy/cards?pluginData=true', function (cards) {
        callback(board, JSON.stringify(cards));
    });
}

function loadCards(board, cards) {
    let result = JSON.parse(cards);
    result.forEach(card => {
        board.addCard(card);
    });

    this.render(board);
}

function render(board) {
    let container = document.getElementById('container');
    container.innerHTML = '';
    board.getAllList().forEach(list => {
        this.renderList(container, list);
        container.appendChild(document.createElement('br'));
    });

    let footer = document.createElement('div');
    footer.innerHTML = `Total estimado: ${board.getTotalEstimatedFromActiveCards()} - Total real: ${board.getTotalRealFromActiveCards()}`;
    container.appendChild(footer);
}

function renderList(container, list) {
    let header = document.createElement('div');
    header.className = 'list-header';
    header.innerHTML = list.name;
    container.appendChild(header);

    this.renderCards(container, list);
}

function renderCards(container, list) {
    const table = document.createElement('table');
    table.className = 'table';
    let header = table.insertRow();
    header.insertCell().appendChild(document.createTextNode('Tarea'));
    header.insertCell().appendChild(document.createTextNode('Estimadas'));
    header.insertCell().appendChild(document.createTextNode('Reales'));
    header.insertCell().appendChild(document.createTextNode('Descripción'));

    list.getActiveCards().forEach((card, index) => {
        let row = table.insertRow();
        row.insertCell().appendChild(document.createTextNode(card.name));
        let col2 = row.insertCell();
        let col3 = row.insertCell();
        let col4 = row.insertCell();

        if (card.pluginData) {
            col2.appendChild(document.createTextNode(card.pluginData.estimated));
            col3.appendChild(document.createTextNode(card.pluginData.real));
        }

        col4.appendChild(document.createTextNode(card.desc));
    });

    let footer = table.insertRow();
    footer.insertCell().appendChild(document.createTextNode('Total'));
    footer.insertCell().appendChild(document.createTextNode(list.getTotalEstimatedFromActiveCards()));
    footer.insertCell().appendChild(document.createTextNode(list.getTotalRealFromActiveCards()));
    footer.insertCell().appendChild(document.createTextNode(''));

    container.appendChild(table);
}

function renderFilters() {
    let container = document.getElementById('filters');
    let html = `<div>`

    LIST.forEach(filter => {
        html += `<input class='filter-list' onchange='handleFilterChange()' type="checkbox" id="${filter.id}" name="${filter.name}"/>${filter.name}`;
    });
    html += `</div>`;

    html += `<div>
        <input class='filter-invoiced' onchange='handleFilterChange()' type="checkbox"/>Solo sin factura
    </div>`
    container.innerHTML = html;
}
class Board {
    constructor(id) {
        this.id = id;
        this.onlyWithoutInvoice = false;
    }
    id;
    onlyWithoutInvoice;
    list = [];

    addList(id, name) {
        this.list.push(new BoardList(id, name, this.onlyWithoutInvoice));
    }

    getList(id) {
        return this.list.filter(x => x.id == id)[0];
    }

    getAllList() {
        return this.list;
    }

    existsList(id) {
        return this.list.filter(x => x.id == id).length > 0;
    }

    addCard(card) {
        if (this.existsList(card.idList)) {
            this.getList(card.idList).addCard(card);
        }
    }

    addActionToCard(idList, action, cardId) {
        if (this.existsList(idList)) {
            this.getList(idList).addActionToCard(action, cardId);
        }
    }

    getTotalRealFromActiveCards() {
        let total = 0;
        this.getAllList().forEach(list => total += list.getTotalRealFromActiveCards());
        return total;
    }

    getTotalEstimatedFromActiveCards() {
        let total = 0;
        this.getAllList().forEach(list => total += list.getTotalEstimatedFromActiveCards());
        return total;
    }
}

class BoardList {
    constructor(id, name, onlyWithoutInvoice) {
        this.id = id;
        this.name = name;
        this.onlyWithoutInvoice = onlyWithoutInvoice;
    }

    id;
    name;
    onlyWithoutInvoice;
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
        if (this.onlyWithoutInvoice) {
            return this.cards.filter(x => !x.closed && !x.isAlreadyInvoced());
        } else {
            return this.cards.filter(x => !x.closed);
        }
    }

    getTotalRealFromActiveCards() {
        let total = 0;
        this.getActiveCards().forEach(card => {
            if (card.pluginData && card.pluginData.real) {
                total += card.pluginData.real;
            }
        });
        return total;
    }

    getTotalEstimatedFromActiveCards() {
        let total = 0;
        this.getActiveCards().forEach(card => {
            if (card.pluginData && card.pluginData.real) {
                total += card.pluginData.estimated;
            }
        });
        return total;
    }
}

class Card {
    constructor(cardJson) {
        this.id = cardJson.id;
        this.name = cardJson.name;
        this.idList = cardJson.idList;
        this.closed = cardJson.closed;
        this.idShort = cardJson.idShort;
        this.desc = cardJson.desc;
        if (cardJson.pluginData) {
            try {
                if (cardJson.pluginData.length) {
                    cardJson.pluginData.forEach(element => {
                        this.pluginData = new pluginData(element);
                    });
                } else if (cardJson.pluginData.id) {
                    this.pluginData = new pluginData(cardJson.pluginData);
                }
            }
            catch (error) {
                console.log(error);
            }
        }
        if (cardJson.labels) {
            cardJson.labels.forEach(label => {
                this.labels.push(new CardLabel(label));
            });
        }
    }

    id;
    name;
    idList;
    closed;
    action;
    idShort;
    desc;
    pluginData = [];
    labels = [];

    isAlreadyInvoced() {
        return this.labels.filter(x => x.name == 'facturado').length > 0;
    }
}

class CardLabel {
    constructor(cardLabelJson) {
        this.id = cardLabelJson.id;
        this.idBoard = cardLabelJson.idBoard;
        this.name = cardLabelJson.name;
        this.color = cardLabelJson.color;
    }
    id;
    idBoard;
    name;
    color;
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
            if (value.pUAnyFieldsBadges && value.pUAnyFieldsBadges.length > 0) {
                this.value = value.pUAnyFieldsBadges[0].v;
                if (this.value.includes('-')) {
                    this.estimated = parseInt(this.value.split('-')[0]);
                    this.real = parseInt(this.value.split('-')[1]);
                } else {
                    this.estimated = 0;
                    this.real = 0;
                }
            }
        }
        this.dateLastUpdated = pluginDataJson.dateLastUpdated;
    }

    id;
    idPlugin;
    scope;
    idModel;
    value;
    estimated = 0;
    real = 0;
    dateLastUpdated;
}

function handleFilterChange() {
    let board = new Board('');
    board.onlyWithoutInvoice = $('.filter-invoiced')[0].checked == true;
    let filters = $('.filter-list:checkbox:checked')
    for (let i = 0; i < filters.length; i++) {
        board.addList(filters[i].id, filters[i].name);
    }

    readTrello(board, loadCards);
}

renderFilters();