var React = require('react');
var ReactDOM = require('react-dom');

class SettingsInput extends React.Component {
    constructor(props) {
        super(props);
        this.handler = this.handler.bind(this);
        this.state = {
            value: this.props.value || ''
        }
    }

    handler(event) {
        this.setState({
            value: event.target.value
        })
    }

    render() {
        return <input
            type="text"
            className="settings-input"
            value={this.state.value}
            onInput={this.handler}
        />
    }
}

class SettingsButtonSave extends React.Component {
    constructor(props) {
        super(props);
    }

    handler() {

    }

    render() {
        return <input type="button" value="save" className="button" />
    }
}

class SettingsButtonAdd extends React.Component {
    constructor(props) {
        super(props);
    }

    handler() {

    }

    render() {
        return <input type="button" className="button" value="Add row" />
    }
}

class SettingsPartRow extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="settings-row">
                <SettingsInput />
                <SettingsButtonSave />
            </div>
        )
    }
}

class SettingsPartsList extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <h1>Parts of scpeech:</h1>
                <SettingsPartRow />
                <SettingsPartRow />
                <SettingsPartRow />
                <SettingsButtonAdd />
            </div>
        )
    }
}

class Parts {
    constructor() {
        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = () => {
            if (ajax.readyState != 4)
                return;            
            console.log(ajax.responseText);
        }
        ajax.open('DELETE', '/api/parts/', true);
        ajax.setRequestHeader('X-CSRFToken', this.getCSRF())
        ajax.send(null);
    }

    getCSRF() {
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

var parts = new Parts();

ReactDOM.render(
    <SettingsPartsList />,
    document.querySelector('.container')
)