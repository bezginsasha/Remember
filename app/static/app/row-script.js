var React = require('react');
var ReactDOM = require('react-dom');

class MyInput extends React.Component {
    render() {
        var css = {
            'background': 'red'
        };
        return <input style={css} />
    }
}

ReactDOM.render(
    <MyInput />,
    document.querySelector('.container')
)