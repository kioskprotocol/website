import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { routerMiddleware } from 'react-router-redux'
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import { rootReducer } from "./redux/reducers";
import { Router, Route } from "react-router";
import createHistory from "history/createBrowserHistory";

import App from "./App";
import "./styles/App.css";

const initialState = {
	config: {
		theme: {
			red: "#FC575E",
			blue: "#32C1FF",
			gray: "#2C363F",
			lightGray: "#6E7E85",
			white: "#F6F8FF"
		},
		menuItems: ["Marketplace", "Purchases", "Products", "Sales"]
	}
};

const history = createHistory();


const routing = routerMiddleware(history);

const store = createStore(
	rootReducer,
	initialState,
	composeWithDevTools(applyMiddleware(thunk, routing))
);

render(
	<Provider store={store}>
		<Router history={history}>
			<div>
				<Route exact path="/" component={App} />
				<Route
					exact
					path="/hello"
					render={() => <h1>Hello, World!</h1>}
				/>
				<Route path="/market/:market" render={() => <App isMarket={true}/>} />
			</div>
		</Router>
	</Provider>,
	document.getElementById("root")
);

// TODO: Figure out hot reloading with React Router
// if (module.hot) {
// 	module.hot.accept();
// }