/*

    KGObjects.js

    prerequisites:
    --------------
    object.js, gui.js, blocks.js, morphic.js


    toc
    ---
    the following list shows the order in which all constructors are
    defined. Firt of all you can find the functionalities that have
    been added to SpriteMorph, StageMorph and SyntaxElementMorph.
    Use this list to locate code in this document:

        SpriteMorph
        StageMorph
        SyntaxElementMorph

        Endpoint
            WikiDataEndpoint
        QueryFunction
        Literal
            DateElement
        Pattern
        Subject
        LogicOperator
        Filter
        Query
        QueryResult
        SearchResult


    credits
    -------
    Vincenzo Offertucci

*/

/*jshint esversion: 6*/

// Global stuff ////////////////////////////////////////////////////////

modules.KGObjects = '2022-September-08';

// Declarations

var Endpoint;
var WikiDataEndpoint;
var QueryFunction;
var Literal;
var DateElement;
var Pattern;
var Subject;
var LogicOperator;
var Filter;
var Query;
var QueryResult;
var SearchResult;

// SpriteMorph ////////////////////////////////////////////////////////

// defining a new custom category
SpriteMorph.prototype.customCategories.set('KGQueries', new Color(153, 0, 0));

const originalAddDefaultScene = Project.prototype.addDefaultScene;

Project.prototype.addDefaultScene = function () {
    originalAddDefaultScene.apply(this);
    let scena = this.scenes.at(1);
    scena.customCategories.set('KGQueries', new Color(153, 0, 0));
};

// defining new blocks
const originalInitBlocks = SpriteMorph.prototype.initBlocks;

SpriteMorph.prototype.initBlocks = function (){
    originalInitBlocks();

    SpriteMorph.prototype.blocks["subject"] = {
        type: 'command',
        category: 'KGQueries',
        spec: 'subject: %s %c',
        defaults: [null, null]
    };
    SpriteMorph.prototype.blocks["pattern"] = {
        type: 'command',
        category: 'KGQueries',
        spec: 'predicate: %s object: %s',
        defaults: [null, null]
    };
    SpriteMorph.prototype.blocks["filter"] = {
        type: 'command',
        category: 'KGQueries',
        spec: 'filter: %s',
        defaults: [null]
    };
    SpriteMorph.prototype.blocks["queryBlock"] = {
        type: 'reporter',
        category: 'KGQueries',
        spec: 'select distinct %exp %br from %kg %br where %c %br order by %s %ord %br limit %n',
        defaults: ['?item', null, null, null, null, 10]
    };
    SpriteMorph.prototype.blocks["literal"] = {
        type: 'reporter',
        category: 'KGQueries',
        spec: '%s @ %s',
        defaults: [null, null]
    };
    SpriteMorph.prototype.blocks["dateElement"] = {
        type: 'reporter',
        category: 'KGQueries',
        spec: 'date: %s',
        defaults: ['AAAA-MM-DD']
    };
    SpriteMorph.prototype.blocks["showQueryResults"] = {
        type: 'reporter',
        category: 'KGQueries',
        spec: 'show results %var',
        defaults: [null]
    };
    SpriteMorph.prototype.blocks["getColumn"] = {
        type: 'reporter',
        category: 'KGQueries',
        spec: 'get column %n from %var',
        defaults: [1, null]
    };
    SpriteMorph.prototype.blocks["getRow"] = {
        type: 'reporter',
        category: 'KGQueries',
        spec: 'get row %n from %var',
        defaults: [1, null]
    };
    SpriteMorph.prototype.blocks["searchEntity"] = {
        type: 'reporter',
        category: 'KGQueries',
        spec: 'search an entity: %s %br from %kg %br select a language: %s',
        defaults: ['something', 'WikiData', 'en']
    };
    SpriteMorph.prototype.blocks["searchProperty"] = {
        type: 'reporter',
        category: 'KGQueries',
        spec: 'search a property: %s %br from %kg %br select a language: %s',
        defaults: ['something', 'WikiData', 'en']
    };
    SpriteMorph.prototype.blocks["translateQueryBlock"] = {
        type: 'reporter',
        category: 'KGQueries',
        spec: 'translate query block: %s',
        defaults: [null]
    };
    SpriteMorph.prototype.blocks["executeQueryBlock"] = {
        type: 'reporter',
        category: 'KGQueries',
        spec: 'execute query block: %s',
        defaults: [null]
    };
    SpriteMorph.prototype.blocks["languageOf"] = {
        type: 'reporter',
        category: 'KGQueries',
        spec: 'language of: %s is %s',
        defaults: [null, 'en']
    };
    SpriteMorph.prototype.blocks["label"] = {
        type: 'reporter',
        category: 'KGQueries',
        spec: 'rdfs:label',
        defaults: []
    };
    SpriteMorph.prototype.blocks["defineEndpoint"] = {
        type: 'reporter',
        category: 'KGQueries',
        spec: 'define a new endpoint %br name: %s %br url: %s',
        defaults: []
    };

};

SpriteMorph.prototype.initBlocks();

SpriteMorph.prototype.originalBlockTemplates = SpriteMorph.prototype.blockTemplates;

SpriteMorph.prototype.blockTemplates = function (
    category = 'motion',
    all = false
){

    function block(selector, isGhosted) {
        if (StageMorph.prototype.hiddenPrimitives[selector] && !all) {
            return null;
        }
        var newBlock = SpriteMorph.prototype.blockForSelector(selector, true);
        newBlock.isTemplate = true;
        if (isGhosted) {newBlock.ghost(); }
        return newBlock;
    }

    blocks = this.originalBlockTemplates(category, all);
    if (category === 'KGQueries'){
        blocks.push('-');
        blocks.push(block('queryBlock'));
        blocks.push(block('subject'));
        blocks.push(block('pattern'));
        blocks.push(block('showQueryResults'));
        blocks.push(block('literal'));
        blocks.push(block('dateElement'));
        blocks.push(block('filter'));
        blocks.push(block('languageOf'));
        blocks.push(block('label'));
        blocks.push('-');
        blocks.push(block('getColumn'));
        blocks.push(block('getRow'));
        blocks.push('-');
        blocks.push(block('searchEntity'));
        blocks.push(block('searchProperty'));
        blocks.push('-');
        blocks.push(block('executeQueryBlock'));
        blocks.push(block('translateQueryBlock'));
        blocks.push('-');
        blocks.push(block('defineEndpoint'));
    }

    return blocks;
};

// selector define for the new blocks

SpriteMorph.prototype.literal = function(string, lang){
    let stringLiteral = '"' + string + '"';
    if(lang !== undefined &&
        lang !== null &&
        lang !== '')
        stringLiteral += "@" + lang;
    return stringLiteral;
};

SpriteMorph.prototype.dateElement = function(string){
    let stringLiteral = '"' + string + '"^^xsd:dateTime';
    return stringLiteral;
};

SpriteMorph.prototype.subject = function(subject, patternBlock){
    return subject;
};

SpriteMorph.prototype.pattern = function(predicate, object){
    return predicate + ' ' + object;
};

SpriteMorph.prototype.filter = function(element){
    return element;
};

SpriteMorph.prototype.queryBlock = function (vars, ep, block, order, direction, limit) {
    let endpoint = null;
    let query = null;
    try{
        if(!ep)
            return 'Please select an endpoint.';
        if(ep[0] === "WikiData")
            endpoint = new WikiDataEndpoint(null, this);
        else
            endpoint = new Endpoint(ep[0], null, this);
        query = new Query(vars, endpoint, block, order, direction, limit);
        query.prepareRequest();
    }
    catch(e){
        return e.message;
    }
    return query;
};

// Creates a global variable named with the value of varName and containing value
// it also adds a watcher to the stage
SpriteMorph.prototype.createResultVar = function (varName, value){
    let ide = world.children[0];
    let scene = ide.scene;
    let stage = this.parentThatIsA(StageMorph);
    scene.globalVariables.addVar(varName, value);
    ide.flushBlocksCache('variables');
    ide.refreshPalette();
    let watcher = this.findVariableWatcher(varName);
    if (watcher !== null) {
        watcher.show();
        watcher.fixLayout(); // re-hide hidden parts
        watcher.keepWithin(stage);
        ide.flushBlocksCache('variables');
        ide.refreshPalette();
    }
    else
        this.toggleVariableWatcher(varName, true);
};

//Handles readyState changes and showes query's results
SpriteMorph.prototype.showResults = function (result){
    let queryResults = null;
    if (result.readyState == 4 && result.status == 200) {
        let response = JSON.parse(result.responseText);
        let rows = response.results.bindings.length;
        if(rows === 0){
            queryResults = new QueryResult(null, 1);
            this.createResultVar('Results', queryResults);
            this.showQueryResults('Results');
            return;
        }
        
        let entry = Object.entries(response.results.bindings[0]);
        let cols = entry.length;
        let resultTable = new Table(cols, rows);
        for(i = 0; i<cols; i++)
            resultTable.setColName(i-1, entry[i][0]);
        
        for(i = 0; i<rows; i++){
            for(j = 0; j<cols; j++){
                entry = Object.entries(response.results.bindings[i]);
                resultTable.set(entry[j][1].value, j+1, i+1);
            }
        }
        
        queryResults = new QueryResult(resultTable, 0);
        this.createResultVar("Results", queryResults);
        this.showQueryResults("Results");
   }
   else if (result.readyState == 4 && result.status == 400) {
        queryResults = new QueryResult(null, 2);
        this.createResultVar('Results', queryResults);
        this.showQueryResults('Results');
    }
};

function UnvalidBlockException(message){
    this.message = message;
};

//shows query results saved inside varName
SpriteMorph.prototype.showQueryResults = function(varName){
    let ide = world.children[0];
    let queryResults = ide.getVar(varName);
    if(queryResults && queryResults.table){
        let tableMorph = new TableMorph(queryResults.table);
        let tableDialogMorph = new TableDialogMorph(
            tableMorph.table,
            tableMorph.globalColWidth,
            tableMorph.colWidths,
            tableMorph.rowHeight
        );

        tableDialogMorph.userMenu = function () {
            var menu = new MenuMorph(this);
            menu.addItem(
                'export as JSON',
                () => ide.saveFileAs(
                    JSON.stringify(queryResults),
                    'text/plain;charset=utf-8',
                    varName
                )
            );
            menu.addItem(
                'export as CSV',
                () => ide.saveFileAs(
                    queryResults.toCSV(),
                    'text/plain;charset=utf-8',
                    varName
                )
            );
            return menu;
        };
        tableDialogMorph.popUp(this.world());
    }
    else if(queryResults || queryResults === 0 || queryResults === ''){
        let dialogBox = new DialogBoxMorph();
        dialogBox.userMenu = function () {
            var menu = new MenuMorph(this);
            menu.addItem(
                'export',
                () => ide.saveFileAs(
                    JSON.stringify(queryResults),
                    'text/plain;charset=utf-8',
                    varName
                )
            );
            return menu;
        };
        let description = queryResults.toString();
        dialogBox.inform('Results', description, world);
    }
    return 'Showing results.';
};

// Allow the user to get a single column from a query result
SpriteMorph.prototype.getColumn = function (index, varName){
    let ide = world.children[0];
    let queryResults = ide.getVar(varName);
    if(typeof(index) !== 'number')
        return queryResults;
    let table = queryResults.table;
    if(!table)
        return new QueryResult(null, 1);
    let resultTable = new Table(1, table.rows());
    resultTable.setColName(-1, table.colName(index));

    let tableColumn = table.col(index);
    if(index > table.cols() || index < 1)
        return new QueryResult(null, 1);
    for(i = 1; i<=table.rows(); i++){
        resultTable.set(tableColumn[i-1], 1, i);
    }
    let column = new QueryResult(resultTable, 0);
    return column;
};

// Allow the user to get a single row from a query result
SpriteMorph.prototype.getRow = function (index, varName){
    let ide = world.children[0];
    let queryResults = ide.getVar(varName);
    if(typeof(index) !== 'number')
        return queryResults;
    let table = queryResults.table;
    if(!table)
        return new QueryResult(null, 1);
    let resultTable = new Table(table.cols(), 1);
    resultTable.setColNames(table.columnNames());

    let tableRow = table.row(index);
    if(index > table.rows() || index < 1)
        return new QueryResult(null, 1);
    for(i = 1; i<=table.cols(); i++){
        resultTable.set(tableRow[i-1], i, 1);
    }
    let row = new QueryResult(resultTable, 0);
    return row;
};

// Allow the user to search for an entity in a knowledge graph
SpriteMorph.prototype.searchEntity = function(search, ep, lang) {
    let endpoint = null;
    if(!ep)
        return 'Please select an endpoint.';
    if(ep[0] === "WikiData")
        endpoint = new WikiDataEndpoint(lang, this);
    else
        endpoint = new Endpoint(ep[0], lang, this);
    endpoint.searchEntity(search, 'item');
    return 'Loading...';
};

// Allow the user to search for a property in a knowledge graph
SpriteMorph.prototype.searchProperty = function(search, ep, lang) {
    let endpoint = null;
    if(!ep)
        return 'Please select an endpoint.';
    if(ep[0] === "WikiData")
        endpoint = new WikiDataEndpoint(lang, this);
    else
        endpoint = new Endpoint(ep[0], lang, this);
    endpoint.searchEntity(search, 'property');
    return 'Loading...';
};

// show search results saved inside varName
SpriteMorph.prototype.showSearchResults = function(varName){
    let ide = world.children[0];
    let searchResults = ide.getVar(varName);
    let dialogBox = new DialogBoxMorph();
    
    let description = '';
    if(searchResults.error === 1 || searchResults.error === 2)
        description = searchResults.toString();
    else
        description = searchResults.label + '\n' + searchResults.description + '\n' + searchResults.concepturi;
    dialogBox.inform('Search Results', description, world);

    // add a menu for exporting results
    dialogBox.userMenu = function () {
        var menu = new MenuMorph(this);
        menu.addItem(
            'export as JSON',
            () => ide.saveFileAs(
                JSON.stringify(searchResults),
                'text/plain;charset=utf-8',
                localize('data')
            )
        );
        menu.addItem(
            'export as CSV',
            () => ide.saveFileAs(
                searchResults.toCSV(),
                'text/plain;charset=utf-8',
                localize('data')
            )
        );
        return menu;
    };
    return null;
};

SpriteMorph.prototype.translateQueryBlock = function(block) {
    let ide = world.children[0];
    let dialogBox = new DialogBoxMorph();
    let description = block.queryString;
    // add a menu for exporting results
    dialogBox.userMenu = function () {
        var menu = new MenuMorph(this);
        menu.addItem(
            'export',
            () => ide.saveFileAs(
                description,
                'text/plain;charset=utf-8',
                'SPARQLQuery'
            )
        );
        return menu;
    };
    
    dialogBox.inform('SPARQL Query', description, world);
    let body = dialogBox.body;
    body.setAlignmentToLeft();
    return block.queryString;
};

SpriteMorph.prototype.executeQueryBlock = function(block) {
    let result = new XMLHttpRequest();
    result.open('GET', block.preparedUrl, true);
    result.send(null);
    result.onreadystatechange = () => this.showResults(result);
    return "Loading...";
};

SpriteMorph.prototype.defineEndpoint = function(name, url) {
    if(!name || name === '')
        return 'Assign a valid name.'
    if(!url || url === '')
        return 'Assign a valid url.'
    Endpoint.prototype.addEndpoint(name, url);
    return "A new endpoint has been added.";
};

// StageMorph ///////////////////////////////////////////////////////////

StageMorph.prototype.oldBlockTemplates = StageMorph.prototype.blockTemplates;

StageMorph.prototype.blockTemplates = function (
    category = 'motion',
    all = false
){
    var myself = this;

    function block(selector) {
        if (myself.hiddenPrimitives[selector] && !all) {
            return null;
        }
        var newBlock = SpriteMorph.prototype.blockForSelector(selector, true);
        newBlock.isTemplate = true;
        return newBlock;
    }

    blocks = this.oldBlockTemplates(category, all);
    if (category === 'KGQueries'){
        blocks.push('-');
        blocks.push(block('queryBlock'));
        blocks.push(block('subject'));
        blocks.push(block('pattern'));
        blocks.push(block('showQueryResults'));
        blocks.push(block('literal'));
        blocks.push(block('dateElement'));
        blocks.push(block('filter'));
        blocks.push(block('languageOf'));
        blocks.push(block('label'));
        blocks.push('-');
        blocks.push(block('getColumn'));
        blocks.push(block('getRow'));
        blocks.push('-');
        blocks.push(block('searchEntity'));
        blocks.push(block('searchProperty'));
        blocks.push('-');
        blocks.push(block('executeQueryBlock'));
        blocks.push(block('translateQueryBlock'));
        blocks.push('-');
        blocks.push(block('defineEndpoint'));
    }

    return blocks;
}

StageMorph.prototype.literal
    = SpriteMorph.prototype.literal;

StageMorph.prototype.dateElement
    = SpriteMorph.prototype.dateElement;

StageMorph.prototype.subject
= SpriteMorph.prototype.subject;

StageMorph.prototype.pattern
    = SpriteMorph.prototype.pattern;

StageMorph.prototype.queryBlock
    = SpriteMorph.prototype.queryBlock;

StageMorph.prototype.createResultVar
    = SpriteMorph.prototype.createResultVar;

StageMorph.prototype.showResults
    = SpriteMorph.prototype.showResults;

StageMorph.prototype.showQueryResults
    = SpriteMorph.prototype.showQueryResults;

StageMorph.prototype.filter
    = SpriteMorph.prototype.filter;

StageMorph.prototype.languageOf
    = SpriteMorph.prototype.languageOf;

StageMorph.prototype.label
= SpriteMorph.prototype.label;

StageMorph.prototype.getColumn
    = SpriteMorph.prototype.getColumn;

StageMorph.prototype.getRow
    = SpriteMorph.prototype.getRow;

StageMorph.prototype.searchEntity
    = SpriteMorph.prototype.searchEntity;

StageMorph.prototype.searchProperty
    = SpriteMorph.prototype.searchProperty;

StageMorph.prototype.showSearchResults
    = SpriteMorph.prototype.showSearchResults;

StageMorph.prototype.translateQueryBlock
    = SpriteMorph.prototype.translateQueryBlock;

StageMorph.prototype.executeQueryBlock
        = SpriteMorph.prototype.executeQueryBlock;

StageMorph.prototype.defineEndpoint
    = SpriteMorph.prototype.defineEndpoint;

// SyntaxElementMorph ///////////////////////////////////////////////////////////

SyntaxElementMorph.prototype.labelParts['%ord'] = {
    type: 'input',
    tags: 'read-only static',
    menu: {
        'ASC' : ['ASC'],
        'DESC' : ['DESC']
    }
};

SyntaxElementMorph.prototype.labelParts['%kg'] = {
    type: 'input',
    tags: 'read-only static',
    menu: {
        'WikiData' : ['WikiData']
    }
};


// Endpoint ///////////////////////////////////////////////////////////

// Represents the generic endpoint for making SPARQL query requests

Endpoint.prototype.constructor = Endpoint;

function Endpoint(endpointName, language, morph){
    this.init(endpointName, language, morph);
};

Endpoint.prototype.EndpointNames = new Map();

Endpoint.prototype.initializeEndpointNames = function(){
    Endpoint.prototype.EndpointNames.set('WikiData', 'https://query.wikidata.org/sparql');
}

Endpoint.prototype.initializeEndpointNames();

Endpoint.prototype.addEndpoint = function(name, url){
    Endpoint.prototype.EndpointNames.set(name, url);
    let menu = SyntaxElementMorph.prototype.labelParts['%kg'].menu;
    if(!menu[name])
        menu[name] = [name];
    else
        throw new UnvalidBlockException('An endpoint with that name is alredy defined.');
}

Endpoint.prototype.init = function(endpointName, language, morph){
    this.baseUrl = Endpoint.prototype.EndpointNames.get(endpointName);
    if(language && language !== '')
        this.language = language;
    else
        this.language = 'en';
    this.morph = morph; // is a SpriteMorph or a StageMorph (if the block is used on a Sprite or a Stage)
    this.entityPrefix = '';
    this.propertyPrefix = '';
};

Endpoint.prototype.searchEntity = function(search, type){
    let requestUrl = this.baseUrl + '?format=json&query=';
    let queryString = '';
    if(type === "property")
        queryString = 'SELECT DISTINCT ?result WHERE {?s ?result ?o. ?result ' + 
        'rdfs:label ?label. FILTER(?label="' + search + '"@' + this.language +') }';
    else
        queryString = 'SELECT DISTINCT ?result WHERE {?result ?p ?o. ?result ' + 
        'rdfs:label ?label. FILTER(?label="' + search + '"@' + this.language +') }';
    requestUrl += queryString;
    let result = new XMLHttpRequest();
    result.open('GET', requestUrl, true);
    result.send(null);
    result.onreadystatechange = () => {
        if (result.readyState == 4 && result.status == 200) {
            json = JSON.parse(result.response);
            let resultList = json.results.bindings;
            if(resultList.length === 0) {
                searchResult = new SearchResult(null, null, null, null, null, 1);
            }
            else {
                let first = resultList[0].result.value;
                if(type === 'item')
                    dataType = 'entity';
                else if(type === 'property')
                    dataType = 'property';
                let label = search;
                let description = '';
                searchResult = new SearchResult('<' + first + '>', dataType, label, description, first, 0);
            }
            this.morph.createResultVar('searchResult', searchResult);
            this.morph.showSearchResults('searchResult');
            return;
        }
        else if(result.readyState == 4 && result.status == 400){
            searchResult = new SearchResult(null, null, null, null, null, 2);
            this.morph.createResultVar('searchResult', searchResult);
            this.morph.showSearchResults('searchResult');
        }
    }
    return search;
};


// WikiDataEndpoint ///////////////////////////////////////////////////////////

WikiDataEndpoint.prototype = new Endpoint();
WikiDataEndpoint.prototype.constructor = WikiDataEndpoint;
WikiDataEndpoint.uber = Endpoint.prototype;

function WikiDataEndpoint(language, morph){
    this.init(language, morph);
};

WikiDataEndpoint.prototype.init = function(language, morph){
    this.baseUrl = 'https://query.wikidata.org/sparql';
    if(language && language !== '')
        this.language = language;
    else
        this.language = 'en';
    this.morph = morph; // is a SpriteMorph or a StageMorph (if the block is used on a Sprite or a Stage)
    this.entityPrefix = 'wd:';
    this.propertyPrefix = 'wdt:';
};


WikiDataEndpoint.prototype.searchEntity = function(search, type){
    let searchResult = null;
    let json = null;
    let requestUrl = 'https://www.wikidata.org/w/api.php?action=wbsearchentities&language=' 
                + this.language +'&uselang=' + this.language + '&type=' + type 
                + '&format=json&origin=*&search=' + search;
    let result = new XMLHttpRequest();
    result.open('GET', requestUrl, true);
    result.send(null);
    result.onreadystatechange = () => {
        if (result.readyState == 4 && result.status == 200) {
            json = JSON.parse(result.response);
            if(json.search.length === 0) {
                searchResult = new SearchResult(null, null, null, null, null, 1);
            }
            else {
                let first = json.search[0];
                if(type === 'item')
                    dataType = 'entity';
                else if(type === 'property')
                    dataType = 'property';
                let label = first.display.label ? first.display.label.value : 'Empty';
                let description = first.display.description ? first.display.description.value : 'Empty';
                searchResult = new SearchResult(first.id, dataType, label, description, first.concepturi, 0);
            }
            this.morph.createResultVar('searchResult', searchResult);
            this.morph.showSearchResults('searchResult');
            return;
        }
        else if(result.readyState == 4 && result.status == 400){
            searchResult = new SearchResult(null, null, null, null, null, 2);
            this.morph.createResultVar('searchResult', searchResult);
            this.morph.showSearchResults('searchResult');
        }
    }
};

// QueryFunction ///////////////////////////////////////////////////////////

QueryFunction.prototype.constructor = QueryFunction;

function QueryFunction(block){
    this.block = block;
    this.type = '';
    if(block.selector === 'languageOf')
        this.type = 'lang';
}

QueryFunction.prototype.getValue = function (){
    let stringLiteral = '';
    if(this.type === 'lang')
        stringLiteral += 'LANG(' + this.getSlotValue(0) + ') = "' + this.getSlotValue(1) + '"';
    return stringLiteral;
}

QueryFunction.prototype.getSlotValue = function(index){
    let slot = this.block.inputs()[index];
    if(slot.selector === 'reportGetVar'){
        let varName = slot.blockSpec;
        let ide = world.children[0];
        let variable = ide.getVar(varName);
        return variable;
    }
    else return slot.allEntryFields()[0].text;
}

// Literal ///////////////////////////////////////////////////////////

Literal.prototype.constructor = Literal;

function Literal(block){
    this.block = block;
}

Literal.prototype.getValue = function (){
    let stringLiteral = '"';
    stringLiteral += this.getSlotValue(0) + '"';
    let lang = this.getSlotValue(1);
    if(lang !== undefined &&
        lang !== null &&
        lang !== '')
        stringLiteral += "@" + lang;
    return stringLiteral;
}

Literal.prototype.getSlotValue = function(index){
    let slot = this.block.inputs()[index];
    if(slot.selector === 'reportGetVar'){
        let varName = slot.blockSpec;
        let ide = world.children[0];
        let variable = ide.getVar(varName);
        return variable;
    }
    else return slot.allEntryFields()[0].text;
}

// DateElement ///////////////////////////////////////////////////////////

DateElement.prototype = new Literal();
DateElement.prototype.constructor = DateElement;
DateElement.uber = Literal.prototype;

function DateElement(block){
    this.block = block;
}

DateElement.prototype.getValue = function (){
    let stringLiteral = '"';
    stringLiteral += this.getSlotValue(0) + '"';
    stringLiteral += "^^xsd:dateTime";
    return stringLiteral;
}

// Pattern ///////////////////////////////////////////////////////////

Pattern.prototype.constructor = Pattern;

function Pattern(block, endpoint){
    this.block = block;
    this.endpoint = endpoint;
    this.propertyValue = this.getSlotValue(0);
    this.entityValue = this.getSlotValue(1);
}

//index is the slot's position index which we want to get the value
Pattern.prototype.getSlotValue = function(index){
    let slot = this.block.inputs()[index];
    if(slot.category === 'variables'){
        let varName = slot.blockSpec;
        let ide = world.children[0];
        let variable = ide.getVar(varName);
        if(variable.type === 'entity')
            return this.endpoint.entityPrefix + variable.id;
        if(variable.type === 'property')
            return this.endpoint.propertyPrefix + variable.id;
        return variable;
    }
    else if(slot.selector === 'literal'){
        return new Literal(slot).getValue();
    }
    else if(slot.selector === 'dateElement'){
        return new DateElement(slot).getValue();
    }
    else if(slot.selector === 'label'){
        return 'rdfs:label';
    }
    else return slot.allEntryFields()[0].text;
}

// Subject ///////////////////////////////////////////////////////////

Subject.prototype.constructor = Subject;

function Subject(rootBlock, endpoint){
    this.rootBlock = rootBlock;
    this.endpoint = endpoint;
    this.patternBlocks = [];
    this.varValue = this.getSlotValue();
    let inputs = rootBlock.inputs();
    let block = inputs[1].inputs()[0];
    while(block){
        if(block.selector !== 'pattern'){
            this.patternBlocks = [];
                throw new UnvalidBlockException('Invalid blocks.');
        }
        let pattern = new Pattern(block, endpoint);
        this.patternBlocks.push(pattern);
        block = block.nextBlock();
    }
};

Subject.prototype.getTriples = function(){
    let patternBlock = null;
    let predicate = null;
    let object = null;
    let triples = null;
    if(this.rootBlock !== null && this.rootBlock.selector === 'subject'){
        let subjectValue = this.varValue;
        triples = subjectValue + ' ';
        for(let i = 0; i<this.patternBlocks.length; i++){
            patternBlock = this.patternBlocks[i];
            predicate = patternBlock.propertyValue;
            object = patternBlock.entityValue;
            triples += predicate + ' ';
            triples += object;
            if(i !== this.patternBlocks.length-1)
                triples += '; \n';
        }
        triples += '. \n';
    }
    return triples;
};

Subject.prototype.getSlotValue = function() {
    let slot = this.rootBlock.inputs()[0];
    if(slot.category === 'variables'){
        let varName = slot.blockSpec;
        let ide = world.children[0];
        let variable = ide.getVar(varName);
        if(variable.type === 'entity')
            return this.endpoint.entityPrefix + variable.id;
        if(variable.type === 'property')
            return this.endpoint.propertyPrefix + variable.id;
        return variable;
    }
    else return slot.allEntryFields()[0].text;
}

// LogicOperator ///////////////////////////////////////////////////////////

LogicOperator.prototype.constructor = LogicOperator;

function LogicOperator(block, endpoint){
    this.block = block;
    this.endpoint = endpoint;
    this.selector = block.selector;
    this.text = '';
    this.logicOperators = [];
    this.buildAll();
}

LogicOperator.prototype.buildAll = function(){
    if(this.selector === undefined){
        this.selector = 'plainText';
        let entryField = this.block.allEntryFields();
        if(entryField.length === 0)
            throw new UnvalidBlockException('Invalid blocks.');
        this.text = entryField[0].text;
    }
    else if(this.selector === 'languageOf'){
        this.selector = 'plainText';
        let fun = new QueryFunction(this.block);
        this.text = fun.getValue();
    }
    else if(this.selector === 'literal'){
        this.selector = 'plainText';
        let literal = new Literal(this.block);
        this.text = literal.getValue();
    }
    else if(this.selector === 'dateElement'){
        this.selector = 'plainText';
        let date = new DateElement(this.block);
        this.text = date.getValue();
    }
    else if(this.selector === 'reportGetVar'){
        this.selector = 'plainText';
        let varName = this.block.blockSpec;
        let ide = world.children[0];
        let value =  ide.getVar(varName);
        if(value.type === 'entity')
            this.text = this.endpoint.entityPrefix + ide.getVar(varName);
        else if(value.type === 'property')
            this.text = this.endpoint.entityPrefix + ide.getVar(varName);
        else
            this.text = ide.getVar(varName);
    }
    else if(this.selector === 'reportAnd' ||
        this.selector === 'reportOr' ||
        this.selector === 'reportEquals' ||
        this.selector === 'reportLessThan' ||
        this.selector === 'reportGreaterThan'){
            this.text = this.block.children[1].text;
            let operator = new LogicOperator(this.block.inputs()[0], this.endpoint);
            this.logicOperators.push(operator);
            operator = new LogicOperator(this.block.inputs()[1], this.endpoint);
            this.logicOperators.push(operator);
    }
    else if(this.selector === 'reportNot'){
        this.text = this.block.children[0].text;
        let operator = new LogicOperator(this.block.inputs()[0], this.endpoint);
        this.logicOperators.push(operator);
    }
    else {
        throw new UnvalidBlockException('Invalid blocks.');
    }
}

LogicOperator.prototype.toString = function(){
    if(this.selector === 'plainText')
        return this.text;
    let string = '';
    if(this.selector === 'reportEquals' ||
    this.selector === 'reportLessThan' ||
    this.selector === 'reportGreaterThan'){
        string += '(' + this.logicOperators[0].toString();
        string += ' ' + this.text + ' ';
        string += this.logicOperators[1].toString() + ')';
    }
    else if(this.selector === 'reportAnd'){
        string += '(' + this.logicOperators[0].toString();
        string += ' && ';
        string += this.logicOperators[1].toString() + ')';
    }
    else if(this.selector === 'reportOr'){
        string += '(' + this.logicOperators[0].toString();
        string += ' || ';
        string += this.logicOperators[1].toString() + ')';
    }
    else if(this.logicOperators.length === 1){
        string += '!(';
        string += this.logicOperators[0].toString() + ')';
    }
    return string;
}

// Filter ///////////////////////////////////////////////////////////

Filter.prototype.constructor = Filter;

function Filter(block, endpoint){
    this.block = block;
    this.endpoint = endpoint;
}

Filter.prototype.getFilter = function(){
    let logicOperator = new LogicOperator(this.block.inputs()[0], this.endpoint);
    return 'FILTER (' + logicOperator.toString() + ') \n';
}


// Query ///////////////////////////////////////////////////////////

Query.prototype.constructor = Query;

function Query(vars, endpoint, firstBlock, order, direction, limit) {
    this.firstBlock = firstBlock;
    this.subjectBlocks = [];
    this.filterBlocks = [];
    this.endpoint = endpoint;
    this.vars = vars;
    this.queryString = '';
    this.preparedUrl = '';
    this.order = order;
    this.direction = direction;
    this.limit = limit;
    let block = firstBlock;
    while(block !== null){
        if(block.selector === 'subject'){
            let subject = new Subject(block, endpoint);
            this.subjectBlocks.push(subject);
        }
        else if(block.selector === 'filter'){
            let filter = new Filter(block, endpoint);
            this.filterBlocks.push(filter);
        }
        else {
            throw new UnvalidBlockException('Invalid blocks.');
        }
        block = block.nextBlock();
    }
};

Query.prototype.getAllTriples = function () {
    let allTriples = '';
    for(let i = 0; i<this.subjectBlocks.length; i++){
        let subject = this.subjectBlocks[i];
        allTriples += subject.getTriples();
    }
    for(let i = 0; i<this.filterBlocks.length; i++){
        let filter = this.filterBlocks[i];
        allTriples += filter.getFilter();
    }
    return allTriples;
};

Query.prototype.prepareRequest = function () {
    let requestUrl = this.endpoint.baseUrl + '?format=json&query=';
    let queryString = 'SELECT DISTINCT ';

    if(this.vars.contents.length > 0 && this.vars.contents[0] !== ''){
        for(i = 0; i<this.vars.contents.length; i++){
            queryString += this.vars.contents[i] + ' ';
        }
    }
    else
        throw new UnvalidBlockException('Select parameters are not valid.');

    queryString += '\nWHERE {\n';
    queryString += this.getAllTriples();
    queryString += '}\n'
    if(this.isOrdered())
        queryString += 'ORDER BY ' + this.direction + '(' + this.order + ') \n';

    if(this.limit != undefined && this.limit !== null && Math.round(this.limit) > 0)
        queryString += 'LIMIT ' + Math.round(this.limit) + ' \n';

    this.queryString = queryString;
    requestUrl += this.encodeQuery(queryString);
    this.preparedUrl = requestUrl;
    return requestUrl;
};

Query.prototype.isOrdered = function() {
    if(this.order === undefined ||
        this.order === null ||
        this.order === '')
        return false;
    if(this.direction === undefined ||
        this.direction === null ||
        this.direction === '')
        this.direction = 'ASC';
    else
        this.direction = this.direction[0];
    return true;
}

Query.prototype.toString = function(){
    return this.queryString;
}

Query.prototype.encodeQuery = function(query){
    let encoded = query.replaceAll('&', '%26');
    return encoded;
}

function buildQueryFromQueryBlock(queryBlock, endpoint){
    let inputs = queryBlock.inputs();
    let selectInputs = inputs[0].inputs();
    let selectInputVars = [];
    ide = world.children[0];

    //getting values from select slots
    for(let i = 0; i<selectInputs.length; i++){
        let varValue;
        if(selectInputs[i].category === 'variables')
            varValue = ide.getVar(selectInputs[i].blockSpec);
        else
            varValue = selectInputs[i].children[0].text;
        selectInputVars.push(varValue);
    }
    //saving array in a list
    let selectVarsList = new List(selectInputVars);

    //getting queryBlock's firstBlock
    let firstBlock = inputs[2].children[0];

    //getting order value
    let order;
    if(inputs[3].category === 'variables')
        order = ide.getVar(inputs[3].blockSpec);
    else
        order = inputs[3].children[0].text;

    //getting direction value
    let direction = inputs[4].constant;

    //getting limit value
    let limit;
    if(inputs[5].category === 'variables')
        limit = ide.getVar(inputs[5].blockSpec);
    else
        limit = inputs[5].children[0].text;

    return new Query(selectVarsList, endpoint, firstBlock, order, direction, limit);
}


// QueryResult ///////////////////////////////////////////////////////////

QueryResult.prototype.constructor = QueryResult;

function QueryResult(table, error) {
    this.table = table;
    this.error = error; // 0 no-error, 1 no results, 2 wrong query
};

QueryResult.prototype.toString = function (){
    if(this.error === 1)
        return 'No results.';
    if(this.error === 2)
        return 'Query is not correct.';
    return this.table.rows() + ' results.';
}

QueryResult.prototype.toCSV = function(){
    let csv = '';
    if(!this.table)
        return csv;
    csv += this.rowToCSV(this.table.columnNames());
    for(let i = 1; i <= this.table.rows(); i++)
        csv += this.rowToCSV(this.table.row(i));
    return csv;
}

QueryResult.prototype.rowToCSV = function(row){
    let str = '';
    for(let i = 0; i < row.length; i++){
        str += row[i];
        if(i !== row.length - 1)
            str += ',';
    }
    str += '\n';
    return str;
}

// SearchResult ///////////////////////////////////////////////////////////

SearchResult.prototype.constructor = SearchResult;

function SearchResult(id, type, label, description, uri, error) {
    this.id = id;
    this.type = type;
    this.label = label;
    this.description = description;
    this.concepturi = uri;
    this.error = error; // 0 no-error, 1 no results, 2 generic error
};

SearchResult.prototype.toString = function (){
    if(this.error === 1)
        return 'No results.';
    if(this.error === 2)
        return 'Something went wrong, please try again.'
    return this.id;
}

SearchResult.prototype.toCSV = function(){
    let csv = '';
    if(this.toString() !== this.id)
        return this.toString();
    csv += 'label, description, cencepturi\n';
    csv += this.label + ', "' + this.description + '", ' + this.concepturi;
    return csv;
}

// loading of utility project
fetch('./utility_project.xml')
    .then(response => response.text())
    .then(data => {
        const ide = world.children[0];
        ide.openProjectString(data);
    })
    .catch(error => console.error('Errore durante il caricamento del progetto:', error));