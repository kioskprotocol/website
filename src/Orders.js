import React, { Component } from 'react'
import { Table } from 'react-bootstrap'

import getWeb3 from './utils/getWeb3'

import publicMarketABI from '../build/contracts/PublicMarket.json'
const contract = require('truffle-contract')

class Orders extends Component {

  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      publicMarket: null,
      orders: []
    }
  }

  componentWillMount() {
    getWeb3.then(results => {
      this.setState({
      web3: results.web3,
    })

      this.initializePublicMarket()
    })
  }

  initializePublicMarket() {
    const publicMarket = contract(publicMarketABI)
    publicMarket.setProvider(this.state.web3.currentProvider)
    publicMarket.deployed().then((instance) => {
      this.setState({ publicMarket: instance.contract }, () => {
        this.getOrders()
      })
    })
  }

  date(timestamp) {
    var date = new Date(timestamp*1000)

    var month = date.getUTCMonth() + 1 //months from 1-12
    var day = date.getUTCDate()
    var year = date.getUTCFullYear()

    var formattedDate = month + "/" + day + "/" + year
    return formattedDate
  }

  getOrders() {
    var seller = this.state.web3.eth.coinbase
    var orders = []
    // Add order event listener
    var newOrderEventAll = this.state.publicMarket.NewOrder({seller: seller}, {fromBlock: 0, toBlock: 'latest'})
    newOrderEventAll.watch((error, result) => {
      if (!error) {

        console.log(result)

        const orderID = result["args"]["orderID"]["c"][0]
        const DIN = result["args"]["DIN"]["c"][0]
        const buyer = result["args"]["buyer"]

        const amountPaid = parseInt(result["args"]["amountPaid"], 10)
        const etherPaid = this.state.web3.fromWei(amountPaid, 'ether')
        
        const timestamp = parseInt(result["args"]["timestamp"], 10)
        const date = this.date(timestamp)

        orders.push(
          {
            orderID: orderID,
            DIN: DIN,
            buyer: buyer,
            amountPaid: etherPaid,
            date: date
          }
        )

        this.setState({ orders: orders })
      } else {
        console.log(error)
      }

      newOrderEventAll = null
    })
  }


	render() {
		return (
      <div>

        <div className="container-orders-table">

          <div className="container-orders-header">
            <h1>Orders</h1>
          </div>

          <div className="orders-table">
            <Table striped bordered condensed hover>
              <tbody>

                <tr>
                  <th>Order ID</th>
                  <th>DIN</th>
                  <th>Buyer</th>
                  <th>Paid</th>
                  <th>Date</th>
                </tr>

                {this.state.orders.map((order, index) => (
                    <tr key={index}>
                      <td>{order.orderID}</td>
                      <td>{order.DIN}</td>
                      <td>{order.buyer}</td>
                      <td>{order.amountPaid}</td>
                      <td>{order.date}</td>
                    </tr>
                  )
                )}

              </tbody>
            </Table>
          </div>

        </div>

      </div>
      
		);
  }

}

export default Orders;