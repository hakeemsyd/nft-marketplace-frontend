import React, { Component } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import KryptoBird from './../../abis/KryptoBird.json';
import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBCardImage,
} from 'mdb-react-ui-kit';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      newToken: '',
      contract: null,
      kryptoBirdz: [],
    };
    this.handlFormValueChnge = this.handlFormValueChnge.bind(this);
  }

  async loadWeb3() {
    const provider = await detectEthereumProvider();
    if (provider) {
      window.web3 = new Web3(provider);
    } else {
      console.log('no ethereum wallet detected.');
    }
  }

  async loadBlockchainData() {
    const accounts = await window.web3.eth.getAccounts();
    this.setState({
      account: accounts[0],
    });

    const networkId = await window.web3.eth.net.getId();
    const networkData = KryptoBird.networks[networkId];

    if (networkData) {
      const abi = KryptoBird.abi;
      const address = networkData.address;
      const contract = new window.web3.eth.Contract(abi, address);
      this.setState({ contract });
      console.log('initialize blockchain: ', contract);
      const totalSupply = await contract.methods.totalSupply().call();
      for (let i = 1; i <= totalSupply; i++) {
        const kryptoBird = await contract.methods.kryptoBirdz(i - 1).call();
        this.setState({
          kryptoBirdz: [...this.state.kryptoBirdz, kryptoBird],
        });
      }
    }
  }

  async mint(token) {
    if (this.state.contract) {
      this.state.contract.methods
        .mint(token)
        .send({ from: this.state.account })
        .on('receipt', function(receipt) {
          console.log('done and reciept');
          this.setState({
            kryptoBirdz: [...this.state.kryptoBirdz, token],
          });
        });
      return;
    } else {
      throw new Error('failed to mint');
    }
  }

  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async handlFormValueChnge(event) {
    this.setState({
      newToken: event.target.value,
    });
  }

  render() {
    {
      console.log(this.state.kryptoBirdz);
    }
    return (
      <div className="container-filled">
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p0 shadow">
          <div
            className="navbar-brand col-sm-3 col-md-3 mr-0"
            style={{ color: 'white' }}
          >
            Krypto Birdz NFTs (Non Fungible tokens)
          </div>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-white">{this.state.account}</small>
            </li>
          </ul>
        </nav>
        <div class="container-fluid mt-1">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-cetner">
              <div className="container mr-auto ml-auto">
                <div className="cotnainer mr-auto">
                  <h1 style={{ color: 'white' }}>
                    KryptoBirdz - NFT MarketPlace
                  </h1>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      console.log('minting: ', this.state.newToken);
                      this.mint(this.state.newToken);
                    }}
                  >
                    <input
                      type="text"
                      id="form12"
                      class="form-control"
                      value={this.state.newToken}
                      onChange={this.handlFormValueChnge}
                    />
                    <button type="submit" class="btn btn-primary btn-block">
                      Mint
                    </button>
                  </form>
                </div>
              </div>
            </main>
          </div>
        </div>
        <hr></hr>
        <div
          className="row textCenter"
          style={{ display: 'flex', justifyContent: 'space-around' }}
        >
          {this.state.kryptoBirdz.map((kryptoBird, key) => {
            return (
              <div>
                <div>
                  <MDBCard className="token img" style={{ maxWidth: '22rem' }}>
                    <MDBCardImage
                      src={kryptoBird}
                      position="top"
                      height="250rem"
                      style={{ marginRight: '4px' }}
                    />
                    <MDBCardBody>
                      <MDBCardTitle> KryptoBirdz - {kryptoBird}</MDBCardTitle>
                      <MDBCardText>
                        {' '}
                        The KryptoBirdz are 20 uniquely generated KBirdz from
                        galaxy mytopia!
                      </MDBCardText>
                    </MDBCardBody>
                  </MDBCard>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default App;
