import React, { Component } from "react";
const PropTypes = require('prop-types');
import { Switch, Route } from "react-router-dom";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import getWeb3 from "./utils/getWeb3";
import Home from "./Home";
import Market from "./Market";
import Products from "./Products";
import Orders from "./Orders";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: null
    };
  }

  // Theme
  getChildContext() {
    return {
      web3: this.state.web3,
      kioskRed: "#FC575E",
      kioskGray: "#2C363F",
      kioskLightGray: "#6E7E85",
      kioskWhite: "#F6F8FF"
    };
  }

  componentWillMount() {
    getWeb3.then(results => {
      this.setState({ web3: results.web3 });
    });
  }

  getAccount() {
    const account = this.state.web3.eth.coinbase;
    this.setState({ account: account });
    this.state.web3.eth.getBalance(account, (error, result) => {
      const formattedBalance =
        this.state.web3.fromWei(result, "ether").toNumber().toFixed(3) + " ETH";
      this.setState({ balance: formattedBalance });
    });
  }

  render() {
    // Make sure there is always a web3 object available
    if (this.state.web3) {
      return (
        <MuiThemeProvider>
          <Switch>
            <Route
              exact
              path="/"
              // https://github.com/ReactTraining/react-router/issues/4627#issuecomment-284133957
              render={props => <Home {...props} web3={this.state.web3} />}
            />
            <Route
              exact
              path="/orders"
              render={props => <Orders {...props} web3={this.state.web3} />}
            />
            <Route
              exact
              path="/products"
              render={props => <Products {...props} web3={this.state.web3} />}
            />
            <Route
              path="/market/:market"
              render={props => <Market {...props} web3={this.state.web3} />}
            />
          </Switch>
        </MuiThemeProvider>
      );
    }
    // TODO: Otherwise, show an error message.
    return null;
  }
}

// Global Variables
App.childContextTypes = {
  web3: PropTypes.object,
  kioskRed: PropTypes.string,
  kioskGray: PropTypes.string,
  kioskLightGray: PropTypes.string,
  kioskWhite: PropTypes.string
};

export default App;