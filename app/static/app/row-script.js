var React = require('react');
var ReactDOM = require('react-dom');

class Request {
    constructor(query) {
        this.query = query;
    }

    getAll(callback) {
        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = () => {
            if (ajax.readyState == 4)
                callback(JSON.parse(ajax.response));
        }
        ajax.open('GET', '/api/' + this.query + '/', true);
        ajax.send();
    }

    getOne(id, callback) {
        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = () => {
            if (ajax.readyState == 4){
                callback(ajax.responseText);
            }
        }
        ajax.open('GET', '/api/' + this.query + '/' + id, true);
        ajax.send();
    }

    other(body, method, callback) {
        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = () => {
            if (ajax.readyState == 4) {
                if (callback) {
                    callback(ajax.responseText);                    
                }
            }
        }
        ajax.open(method, '/api/' + this.query + '/', true);
        ajax.setRequestHeader('X-CSRFToken', this._getCSRF())
        ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
        ajax.send(body);
    }

    _getCSRF() {
        var str = document.cookie;
        if (!str)
            return;
        var ar = str.split(';'),
            csrf = '',
            pattern = /^csrftoken/;
        ar.forEach((value) => {
            if (pattern.test(value))
                csrf = value;
        });
        return csrf.substr(csrf.indexOf('=') + 1);
    }
}



// Здесь компоненты для страницы с настройками
class SettingsInput extends React.Component {
    constructor(props) {
        super(props);
        this.handler = this.handler.bind(this);
        this.input = React.createRef();
        this.state = {
            value: this.props.value || ''
        }
    }

    handler(event) {
        this.props.callback(event.target.value);
    }

    componentDidMount() {
        this.input.current.focus();
    }

    render() {
        return <input
            ref={this.input}
            type="text"
            className="input settings-input"
            value={this.props.value}
            onInput={this.handler}
            tabIndex={this.props.id}
        />
    }
}

class SettingsInputColor extends React.Component {
    constructor(props) {
        super(props);
        this.handler = this.handler.bind(this);
    }

    handler(event) {
        this.props.callback(event.target.value);
    }

    render() {
        return (
            <React.Fragment>
                <span className="settings-sharp" >#</span>
                <input
                    type="text"
                    className='input settings-input-color'
                    value={this.props.value}
                    onInput={this.handler}
                    style={{ background: '#' + this.props.value }}
                />
            </React.Fragment>
        )
    }
}

class SettingsButtonSave extends React.Component {
    constructor(props) {
        super(props);
        this.handler = this.handler.bind(this);
    }

    handler() {
        this.props.callback();
    }

    render() {
        return <input
            type="button"
            value="save"
            className="button"
            onClick={this.handler}
            style={{ visibility: this.props.visibility}}
        />
    }
}

class SettingsButtonAdd extends React.Component {
    constructor(props) {
        super(props);
        this.handler = this.handler.bind(this);
    }

    handler() {
        this.props.callback();
    }

    render() {
        return <input type="button" className="button" value="Add row" onClick={this.handler} />
    }
}

class SettingsPartRow extends React.Component {
    constructor(props) {
        super(props);
        this.inputHandler = this.inputHandler.bind(this);
        this.buttonHandler = this.buttonHandler.bind(this);
        this.updateId = this.updateId.bind(this);
        this.state = {
            value: this.props.value,
            id: this.props.id,
            savedValue: this.props.value,
            selfDisplay: 'block',        
            buttonVisibility: 'hidden',            
        }
    }

    inputHandler(value) {
        this.setState({
            value: value,
            buttonVisibility: value == this.state.savedValue ? 'hidden' : 'visible'
        });
    }

    updateId(id) {
        this.setState({
            id: id
        })
        // console.log(id);
    }

    buttonHandler() {
        var value = this.state.value,
            body = '',
            method = '',
            callback = null;

        // Удаление
        if (!value){
            body = 'id=' + this.state.id;
            method = 'DELETE';
            this.setState({
                selfDisplay: 'none'
            })
        }

        // Добавление
        if (!this.state.id){
            body = 'value=' + encodeURIComponent(this.state.value);
            method = 'POST';
            callback = this.updateId;
        }

        // Редактирование
        if (!body){
            body = 'value=' + encodeURIComponent(this.state.value) + ';id=' + this.state.id;
            method = 'PUT'
        }

        new Request('parts').other(body, method, callback);
        this.setState({
            buttonVisibility: 'hidden',
            savedValue: this.state.value
        })
    }

    render() {
        return (
            <div className="settings-row" style={{display: this.state.selfDisplay}}>
                <SettingsInput value={this.state.value} callback={this.inputHandler} id={this.state.id} />
                <SettingsButtonSave callback={this.buttonHandler} visibility={this.state.buttonVisibility} />
            </div>
        )
    }
}

class SettingsCategoryRow extends React.Component {
    constructor(props) {
        super(props);
        this.valueInputHandler = this.valueInputHandler.bind(this);
        this.colorInputHandler = this.colorInputHandler.bind(this);
        this.buttonSaveHandler = this.buttonSaveHandler.bind(this);
        this.state = {
            value: this.props.category.value,
            color: this.props.category.color,
            savedValue: this.props.category.value,
            savedColor: this.props.category.color,
            buttonVisibility: 'hidden',
            selfVisibility: 'block',
            id: this.props.category.id
        }
    }

    valueInputHandler(value) {
        this.setState({
            value: value
        });
        if ((value == this.state.savedValue) && (this.state.color == this.state.savedColor)) {
            this.setState({
                buttonVisibility: 'hidden'
            })
        }
        else {
            this.setState({
                buttonVisibility: 'visible'
            })
        }
    }

    colorInputHandler(color) {
        if (color.length < 7) {
            this.setState({
                color: color
            })
        }
        if ((color == this.state.savedColor) && (this.state.value == this.state.savedValue)) {
            this.setState({
                buttonVisibility: 'hidden'
            })
        }
        else {
            this.setState({
                buttonVisibility: 'visible'
            })
        }
    }

    buttonSaveHandler() {
        var value = this.state.value,
            color = this.state.color,
            body = '',
            method = '',
            callback = null;

        // Обновление сохранённых данных
        this.setState({
            buttonVisibility: 'hidden',
            savedValue: value,
            savedColor: color
        })

        // Удаление
        if ((!value) && (!color)) {
            body = 'id=' + this.state.id;
            method = 'DELETE';
            this.setState({
                selfVisibility: 'none'
            })
        }

        // Добавление
        if (!this.state.id) {
            var value = encodeURIComponent(this.state.value);
            var color = encodeURIComponent(this.state.color);
            body = 'color=' + color + ';value=' + value;
            method = 'POST';
            callback = id => {
                this.setState({
                    id: id
                });
                // console.log(id);
            }
        }

        // Редактирование
        if (!body) {
             var value = encodeURIComponent(this.state.value);
             var color = encodeURIComponent(this.state.color);
             var id = this.state.id;
             body = 'value=' + value + ';color=' + color + ';id=' + id;
             method = 'PUT';
        }

        new Request('categories').other(body, method, callback);
    }

    render() {
        return (
            <div className="settings-row" style={{display: this.state.selfVisibility}} >
                <SettingsInput value={this.state.value} callback={this.valueInputHandler} />
                <SettingsInputColor value={this.state.color} callback={this.colorInputHandler} />
                <SettingsButtonSave visibility={this.state.buttonVisibility} callback={this.buttonSaveHandler} />
            </div>
        )
    }
}

class SettingsPartsList extends React.Component {
    constructor(props) {
        super(props);
        this.buttonHandler = this.buttonHandler.bind(this);
        var callback = items => this.setState({
            items: items
        });
        new Request('parts').getAll(callback);
        this.state = {
            items: []
        }
    }

    _getMapped(items) {
        return items.map(item => {
            return <SettingsPartRow key={item.id} id={item.id} value={item.value} />
        })
    }

    buttonHandler() {
        var items = this.state.items;
        items.push({
            id: 0,
            value: ''
        });
        this.setState({
            items: items
        })
    }

    render() {
        return (
            <div>
                <h1>Parts of speech:</h1>
                {this._getMapped(this.state.items)}
                <SettingsButtonAdd callback={this.buttonHandler} />
            </div>
        )
    }
}

class SettingsCategoryList extends React.Component {
    constructor(props) {
        super(props);
        this.buttonHandler = this.buttonHandler.bind(this);
        var callback = categories => this.setState({
            'categories': categories
        })
        this.state = {
            categories: []
        }
        new Request('categories').getAll(callback);
    }

    buttonHandler() {
        var categories = this.state.categories;
        categories.push({
            id: 0,
            value: '',
            color: ''
        });
        this.setState({
            categories: categories
        })
    }

    mapCategories(categories) {
        return categories.map( category => {
            return <SettingsCategoryRow key={category.id} category={category} />
        })
    }

    render() {
        return (
            <div>
                <h1>Categories:</h1>
                {this.mapCategories(this.state.categories)}
                <SettingsButtonAdd callback={this.buttonHandler} />
            </div>
        )
    }
}



// Здесь селект, который я сам написал)))
class MyOption extends React.Component {
    constructor(props) {
        super(props);
        this.clickHandler = this.clickHandler.bind(this);
    }

    clickHandler() {
        this.props.clickOption(this.props.value);
    }

    render() {
        return <div className="new-word-option" onClick={this.clickHandler}>{this.props.value}</div>
    }
}

class MyOptionsList extends React.Component {
    constructor(props) {
        super(props)
    }

    mapItems(items) {
        return items.map( (item, index) => <MyOption key={index} value={item} clickOption={this.props.clickOption} />)
    }

    render() {
        var style = {
            top: this.props.top,
            left: this.props.left,
            display: this.props.visibility
        }
        if (this.props.visibility) {
            return (            
                <div className="new-word-options-list" style={style}>
                    {this.mapItems(this.props.items)}
                </div>
            )
        }
        else {
            return null;
        }
    }
}

class MySelect extends React.Component {
    constructor(props) {
        super(props);
        this.clickHandler = this.clickHandler.bind(this);
        this.clickOptionHandler = this.clickOptionHandler.bind(this);
        this.updateOptionsList = this.updateOptionsList.bind(this);
        this.element = React.createRef();
        this.state = {
            showList: false,
            top: '0px',
            left: '0px',
        }
    }

    updateOptionsList() {
        // Вынес в отдульный метод, из-за проверки ниже, чтобы надпись
        // и стрелка также показывали список при нажатии
        var coordinates = this.element.current.getBoundingClientRect();
        this.setState({
            showList: true,
            top: coordinates.top + 'px',
            left: coordinates.left + 'px'
        })
    }

    clickHandler(event) {
        // Проверка если нажали не на сам селект, то ретён
        if (this.element.current != event.target)
            return;

        // Если всё ок
        this.updateOptionsList();
    }

    clickOptionHandler(value) {
        this.setState({
            showList: false,
        });
        this.props.callback(value);
    }

    render() {
        var value = this.props.value ? this.props.value : 'Select item';
        return (
            <div ref={this.element} className="new-word-select" onClick={this.clickHandler}>
                <span onClick={this.updateOptionsList}>{value}</span>
                <span onClick={this.updateOptionsList} className="fas fa-sort-down new-word-select-arrow" />
                <MyOptionsList
                    top={this.state.top}
                    left={this.state.left}
                    items={this.props.items}
                    clickOption={this.clickOptionHandler}
                    visibility={this.state.showList}
                />
            </div>
        )
    }
}



// Здесь компоненты для окна с формой new word
class NewWordInput extends React.Component {
    constructor(props) {
        super(props);
        this.handler = this.handler.bind(this);
    }

    handler(event) {
        this.props.callback(event.target.value, this.props.number);
    }

    render() {
        return (
            <div className="new-word-row">
                <div className="new-word-left-column">
                    {this.props.label}
                </div>
                <div className="new-word-right-column">
                    <input type="text" className="input" onInput={this.handler} value={this.props.value} />
                </div>
            </div>
        )
    }
}

class NewWordSelect extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="new-word-row">
                <div className="new-word-left-column">
                    {this.props.label}
                </div>
                <div className="new-word-right-column">
                    <MySelect items={this.props.items} callback={this.props.callback} value={this.props.value} />
                </div>
            </div>
        )
    }
}

class NewWordPartRow extends React.Component {
    constructor(props) {
        super(props);
        this.partChange = this.partChange.bind(this);
        this.valueChange = this.valueChange.bind(this);
    }

    partChange(value) {
        var object = this.props.object;
        object.part = value;
        this.props.callback(object, this.props.number);
        this.props.addRow(value, this.props.number);
    }

    valueChange(value, number) {
        var object = this.props.object;
        object.values[number] = value;
        if (object.values[number + 1] === undefined)
            object.values.push(null)
        if (!value)
            if (!object.values[number + 1])
                if (object.values.length == number + 2)
                    object.values.pop();
        this.props.callback(object, this.props.number);
    }

    render() {
        var items = [
            'noun',
            'verb',
            'adjective',
        ]
        return (
            <React.Fragment>
                <hr />
                <NewWordSelect label="Part of speech:" items={items} value={this.props.object.part} callback={this.partChange} />

                { this.props.object.values.map( (item, index) =>
                    <NewWordInput
                        key={index}
                        value={item}
                        label={index == 0 ? 'Translated value:' : null}
                        number={index}
                        callback={this.valueChange}
                    />
                ) }

            </React.Fragment>
        )
    }
}

class NewWordButtonSection extends React.Component {
    constructor(props) {
        super(props)
        this.okHandler = this.okHandler.bind(this);
    }

    okHandler() {
        this.props.buttonOkCallback();
    }

    render() {
        return (
            <div className="new-word-button-section">
                <input type="button" value="Cancel" className="button" />
                <input type="button" value="Ok" className="button" onClick={this.okHandler} />
            </div>
        )
    }
}

class NewWordForm extends React.Component {
    constructor(props) {
        super(props);

        var word = this.props.word;
        if (!this.props.word) {
            word = {
                originalValue: null,
                category: null,
                translatedValues: [
                    {
                        part: null,
                        values: [ null ]
                    },
                ]
            }
        }

        this.originalValueChange = this.originalValueChange.bind(this);
        this.categoryChange = this.categoryChange.bind(this);
        this.partRowChange = this.partRowChange.bind(this);
        this.addRow = this.addRow.bind(this);
        this.buttonOkHandler = this.buttonOkHandler.bind(this);

        this.state = {
            word: word
        }
    }

    originalValueChange(value) {
        this.setState( oldState => {
            var word = oldState.word;
            word.originalValue = value;
            return {
                word: word
            }
        });
    }

    categoryChange(value) {
        this.setState( oldState => {
            var word = oldState.word;
            word.category = value;
            return {
                word: word
            }
        });
    }

    partRowChange(object, number) {
        this.setState( oldState => {
            var word = oldState.word;
            word.translatedValues[number] = object;
            return {
                word: word
            }
        })
    }

    addRow(value, number) {
        this.setState( oldState => {
            var word = oldState.word;
            if (value != 'none')
                if (word.translatedValues.length == number + 1)
                    if (!word.translatedValues[number + 1]) {
                        word.translatedValues.push({
                            part: null,
                            values: [ null ]
                        });
                    }
                    
            return {
                word: word
            }
        });
    }

    buttonOkHandler() {
        var body = 'data=' + JSON.stringify(this.state.word);
        new Request('words').other(body, 'POST', console.log)
    }

    render() {
        var items = [
            'qweqwe',
            'lolkek',
            'new',
        ];
        // console.log(this.state.word);
        return ReactDOM.createPortal(
            <div className="new-word-form">
                <h1>New word</h1>

                <NewWordInput label="Original value:" value={this.state.word.originalValue} callback={this.originalValueChange} />
                <NewWordSelect label="Category:" items={items} value={this.state.word.category} callback={this.categoryChange} />

                { this.state.word.translatedValues.map( (item, index) => 
                <NewWordPartRow key={index} number={index} object={item} callback={this.partRowChange} addRow={this.addRow} /> ) }

                <NewWordButtonSection buttonOkCallback={this.buttonOkHandler} />
            </div>,
            document.querySelector('.foreground')
        )
    }
}



// Здесь главная страничка, то есть со списком всех слов и поиском
class MainButtonSection extends React.Component {
    constructor(props) {
        super(props);
    }

    showNewWord() {
        document.querySelector('.foreground').style.display = '';
        
    }

    render() {
        return (
            <section className="main-button-section">
                <input type="button" className="button" value="Add word" onClick={this.showNewWord}/>
                <input type="button" className="button" value="Game" />
                <input type="button" className="button" value="Settings" />
            </section>
        )
    }
}

class MainSearch extends React.Component {
    constructor(props) {
        super(props);
        this.handler = this.handler.bind(this);
    }

    handler(event) {
        this.props.callback(event.target.value);
    }

    render() {
        return <input 
            type="text"
            className="main-search"
            onInput={this.handler}
            value={this.props.value}
        />
    }
}

class MainCategory extends React.Component {
    constructor(props) {
        super(props);
        this.handler = this.handler.bind(this);
    }

    handler() {
        var id = this.props.id || 0;
        this.props.callback(id);
    }

    render() {
        return (
            <div
                className="main-category"
                style={{background: '#' + this.props.color}}
                children={this.props.value}
                onClick={this.handler}
            />
        )
    }
}

class MainCategorySection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: []
        }
        var callback = categories => this.setState({
            categories: categories
        })
        new Request('categories').getAll(callback);
    }

    render() {
        return (
            <section>
                <MainCategory
                    value="all"
                    color="fff"
                    callback={this.props.callback}
                />
                {
                    this.state.categories.map( category =>
                        <MainCategory
                            value={category.value}
                            color={category.color}
                            callback={this.props.callback}
                            id={category.id}
                            key={category.id}
                        />
                    )
                }
            </section>
        )
    }
}

class MainWordMenu extends React.Component {
    constructor(props) {
        super(props);
        this.editHandler = this.editHandler.bind(this);
        this.deleteHandler = this.deleteHandler.bind(this);
    }

    editHandler() {
        this.props.closeMenu();
        console.log(123)
    }

    deleteHandler() {
        this.props.closeMenu();
        new Request('words').other('id=' + 0, 'DELETE', console.log);
        console.log(1234);
    }

    render() {
        var style = {
            top: this.props.y,
            left: this.props.x
        }
        return (
            <div
                className="main-word-menu"
                style={style}
                children={
                    <React.Fragment>
                        <span onClick={ this.editHandler }>Edit word</span>
                        <span onClick={ this.deleteHandler }>Delete word</span>
                        <span>Make hard</span>
                        <span>Make easy</span>
                    </React.Fragment>
                }
            />
        )
    }
}

class MainWord extends React.Component {
    constructor(props) {
        super(props);
        this.contextMenuHandler = this.contextMenuHandler.bind(this);
        this.closeMenu = this.closeMenu.bind(this);
        this.state = {
            showMenu: false,
            x: 0,
            y: 0
        }
    }

    contextMenuHandler(event) {
        event.preventDefault();
        this.setState({
            showMenu: true,
            x: event.pageX,
            y: event.pageY
        })
    }

    closeMenu() {
        this.setState({
            showMenu: false,
        })
    }

    render() {
        return (
            <div
                className="main-word"
                onContextMenu={this.contextMenuHandler}
                children={
                    <React.Fragment>
                        <span>{this.props.value}</span>
                        {this.state.showMenu ?
                            <MainWordMenu
                                x={this.state.x}
                                y={this.state.y}
                                closeMenu={this.closeMenu}
                            /> :
                            null}
                    </React.Fragment>
                }
            />
        )
    }
}

class MainWordSection extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <section className="main-word-list">
            {
                this.props.words.map( word =>
                    <MainWord
                        key={word.id}
                        value={word.value}
                    />
                )
            }
            </section>
        )
    }
}

class MainContainer extends React.Component {
    constructor(props) {
        super(props);
        this.searchHandler = this.searchHandler.bind(this);
        this.categoryClickHandler = this.categoryClickHandler.bind(this);
        this.state = {
            words: [],
            searchValue: ''
        };
        var callback = words => this.setState({
            words: words
        });
        new Request('words/0').getAll(callback);
    }

    searchHandler(value) {
        this.setState({
            searchValue: value
        })
    }

    categoryClickHandler(categoryId) {
        var callback = words => this.setState({
            words: words
        });
        new Request('words/' + categoryId)
            .getAll(callback);
    }

    mapWords(word) {
        // В this лежит параметр, переданный методу map вторым аргументом
        var searchStr = this,
            power = 0;
        // Так просто красивее
        var id = word.id,
            word = word.value;

        for (var i = 0; i < word.length; i++) {
            if (word[i] == searchStr[i])
                power += 3;
            if (word[i] == searchStr[i + 1])
                power++;
            if (word[i] == searchStr[i - 1])
                power++;
        }       

        return {
            id: id,
            value: word,
            power: power
        }
    }

    sortWords(w1, w2) {
        return w2.power - w1.power;
    }

    render() {
        var wordList = this.state.words
            .map(
                this.mapWords,
                this.state.searchValue
            )
            .sort(this.sortWords)
            .slice(0, 20);

        return (
            <React.Fragment>
                <MainButtonSection />
                <MainSearch
                    callback={this.searchHandler}
                    value={this.state.searchValue}
                />
                <MainCategorySection
                    callback={this.categoryClickHandler}
                />
                <MainWordSection
                    words={wordList}
                />
                <NewWordForm />
            </React.Fragment>
        )
    }
}

ReactDOM.render(
    <MainContainer />,
    document.querySelector('.container')
)

// ReactDOM.render(
//     <NewWordForm />,
//     document.querySelector('.foreground')
// )

// ReactDOM.render(
//     <React.Fragment>
//         <SettingsPartsList />
//         <SettingsCategoryList />        
//     </React.Fragment>,
//     document.querySelector('.container')
// )