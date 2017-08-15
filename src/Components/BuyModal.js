import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";
import QuantityPicker from "./QuantityPicker";
import MarketJSON from "../../build/contracts/Market.json";
import { buyProduct } from "../utils/buy";

class BuyModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			quantity: 1
		}

		this.handleBuy = this.handleBuy.bind(this);
		this.handleQuantityChange = this.handleQuantityChange.bind(this);
	}

	handleBuy(quantity) {
		const DIN = this.props.product.DIN;
		const marketContract = this.props.web3.eth.contract(MarketJSON.abi);
		const market = marketContract.at(this.props.product.market);
		const priceInWei = market.price(this.props.product.DIN, 1);
		const buyer = this.props.web3.eth.accounts[0];
		console.log(quantity)
		buyProduct(DIN, quantity, priceInWei, buyer, market);
	}

	handleQuantityChange(eventKey) {
		this.setState({ quantity: eventKey });
	}

	render() {
		const hidden = { display: "none" };
		const visible = { display: "block" };

		return (
			<Modal
				{...this.props}
				animation={false}
				bsSize="small"
				aria-labelledby="contained-modal-title-sm"
				className="buy-modal"
			>
				<Modal.Header closeButton />
				<Modal.Body>
					<h1 className="buy-modal-name">
						{this.props.product.name}
					</h1>
					<p className="buy-modal-din">
						{this.props.product.DIN}
					</p>
					<div className="buy-modal-subtitle-container">
						<h4 className="buy-modal-quantity">Quantity</h4>
						<div className="buy-modal-quantity-picker">
							<QuantityPicker handleQuantityChange={this.handleQuantityChange}/>
						</div>
					</div>
					<div className="buy-modal-subtitle-container">
						<h4 className="buy-modal-price-label">Price</h4>
						<h4 className="buy-modal-price-value">
							{this.props.product.price + " ETH"}
						</h4>
					</div>
				</Modal.Body>
				<Button
					style={this.props.product.available === true ? visible : hidden}
					className="buy-now"
					onClick={() => this.handleBuy(this.state.quantity)}
				>
					Buy Now
				</Button>
				<Button
					style={this.props.product.available === false ? visible : hidden}
					className="not-available"
				>
					Not Available
				</Button>
			</Modal>
		);
	}
}

export default BuyModal;