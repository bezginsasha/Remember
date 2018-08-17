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
            value: ''
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
            value: value
        });
        this.props.callback(value);
    }

    render() {
        var value = this.state.value ? this.state.value : 'Select item';
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
class NewWordForm extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        var items = [
            'noun',
            'verb',
            'adjective',
        ]
        return (
            <div className="new-word-form">
                <h1>New word</h1>
                <MySelect items={items} callback={ console.log } />
                <MySelect items={items} callback={ console.log } />
                <MySelect items={items} callback={ console.log } />
            </div>
        )
    }
}

ReactDOM.render(
    <NewWordForm />,
    document.querySelector('.foreground')
)

// ReactDOM.render(
//     <React.Fragment>
//         <SettingsPartsList />
//         <SettingsCategoryList />        
//     </React.Fragment>,
//     document.querySelector('.container')
// )