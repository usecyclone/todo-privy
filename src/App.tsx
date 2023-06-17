import React, { useEffect } from "react";
import "./App.css"
import { usePrivy } from '@privy-io/react-auth';

import axios from "axios";

import Header from "./components/Header";
import ListComponent from "./components/ListComponent";
import Footer from "./components/Footer";

import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import ReactGA from 'react-ga';
import { Rings } from 'react-loader-spinner'

import Pusher from 'pusher-js';

import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, ApolloLink } from '@apollo/client';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #FF7D3A',
  borderRadius: '10px',
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
};

const TRACKING_ID = String(process.env.REACT_APP_TRACKING_ID)

export default function App() {
  const [deployed, setDeployed] = React.useState(false);
  const [uri, setUri] = React.useState('');
  const [contractAddress, setContractAddress] = React.useState<string | undefined>();
  const [open, setOpen] = React.useState(false);
  const [response, setResponse] = React.useState("");
  const handleClose = () => setOpen(false);
  const { ready, authenticated, user, login, getAccessToken } = usePrivy()
  let [deploymentId, setDeploymentId] = React.useState<string>()

  function requestDeployToGateway(address: string) {
    getAuthToken(address)
      .then((token) => {
        
        localStorage.setItem("auth_token", String(token));

        const url = `https://${process.env.REACT_APP_PROJECT_ID}.${process.env.REACT_APP_CEDALIO_DOMAIN}/deploy`;

        // const payload = {
        //   email: "todo-multi.cedalio.com",
        //   schema: `type Todo @model{
        //     title: String!
        //     description: String
        //     priority: Int!
        //     tags: [String!]
        //     "Posibles status, ready, done and deleted."
        //     status: Status
        //  }
         
        //  enum Status {
        //    DONE
        //    DELETED
        //    READY
        //  }`,
        //   schema_owner: address,
        //   network: "polygon:mumbai",
        // };

        setOpen(true);

        axios
          .post(url, {}, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then(function (response: any) {
            localStorage.setItem("deploymentId", response.data.deployment_id);
            setDeploymentId(response.data.deployment_id)
            // localStorage.setItem(
              //   "contractAddress",
              //   response.data.contract_address
              // );
            localStorage.setItem("deployed", "true");
            bindPusherChannel(response.data.deployment_id)
            setContractAddress(response.data.contract_address);
            setOpen(false);
            setResponse("success");
            setUri(
              `https://${process.env.REACT_APP_PROJECT_ID}.${process.env.REACT_APP_CEDALIO_DOMAIN}/${deploymentId}/graphql`
            );
          })
          .catch(function (error: any) {
            console.log(error);
            setResponse("error");
          });
      })
      .catch(function (error: any) {
        console.log(error);
        setResponse("error");
      });
  }

  function bindPusherChannel(deploymentId:string) {
    var pusher = new Pusher(String(process.env.REACT_APP_PUSHER_KEY), {
        cluster: 'us2'
    });
    if(deploymentId){
      const channelName = String(deploymentId)
      var channel = pusher.subscribe(channelName);
      console.log("binded",String(process.env.REACT_APP_PUSHER_KEY),channelName )
      channel.bind('deployment', function (data: any) {
        console.log(data)
         if (data.status === "Finished") {
            setDeployed(true);
          }
          else {
             console.log(data)
          }
      });
    }
}

  async function redeploy() {
    setResponse("")
    if (user?.wallet?.address) {
      return requestDeployToGateway(String(user?.wallet?.address))
    }
  }

  async function getAuthToken(address: string) {

    const url = `https://${process.env.REACT_APP_PROJECT_ID}.${process.env.REACT_APP_CEDALIO_DOMAIN}/auth/privy`

    //when using privy sdk the value is stored as string with ""
    const privyToken = await getAccessToken()
    console.log("TOKEN", privyToken)

    const payload = {
      "jwt": privyToken,
      "account": address
    }
    const response =await axios.post(
      url, payload
    )
    const token = response.data.token
    return token
    
  }

  useEffect(() => {
    const deployed = Boolean(localStorage.getItem('deployed'))
    const deploymentId = localStorage.getItem('deploymentId')
    if (deployed && deploymentId) {
      setUri(`https://${process.env.REACT_APP_PROJECT_ID}.${process.env.REACT_APP_CEDALIO_DOMAIN}/${deploymentId}/graphql`)
      setDeployed(deployed)
    }
    else if (ready && authenticated) {
      if (user?.wallet?.address) {
        return requestDeployToGateway(String(user?.wallet?.address))
      }
    }
    else {
      return
    }
  }, [ready, authenticated])

  const httpLink = new HttpLink({ uri: uri });
  const authLink = new ApolloLink((operation, forward) => {
    // Retrieve the authorization token from local storage.
    const token = localStorage.getItem('auth_token');

    // Use the setContext method to set the HTTP headers.
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : ''
      }
    });

    // Call the next link in the middleware chain.
    return forward(operation);
  });

  const client = new ApolloClient({
    link: authLink.concat(httpLink), // Chain it with the HttpLink
    cache: new InMemoryCache({
      addTypename: false, //TODO this must be removed
    })
  });

  ReactGA.initialize(TRACKING_ID);

  const Loader = () => {
    if (response === "error") {
      return (
        <div className="loader-layer" style={{ justifyContent: 'center', display: "flex", flexDirection: "column" }}>
          <p className='error-message' style={{ textTransform: 'uppercase', textAlign: "center", color: "black", fontWeight: "200" }}>We had a <strong> problem </strong>trying to deploy please <strong>retry</strong>.</p>
          <button className="retry-button" onClick={redeploy}>RETRY</button>
        </div>
      )
    }
    else {
      return (
        <div className="loader-layer" style={{ justifyContent: 'center' }}>
          <Rings
            height="100"
            width="100"
            radius={2}
            color="#FF7D3A"
            ariaLabel="puff-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      )
    }
  }

  return (
    <ApolloProvider client={client}>
      <div className="App">
        <Header />
        <div className={authenticated ? `button-container connected` : `button-container`} >
          {authenticated
            ? <button className="logged-icon">{user?.wallet?.address}</button>
            : <button className="login-button" onClick={login} >LOGIN TO DEPLOY</button>}
        </div>
        <div className="gif-container" style={authenticated ? { display: 'none' } : { display: 'flex' }} >
          <div className="web">
            <img className="gif" src="home-gif.gif" alt="explained gif" />
          </div>
        </div>
        {deployed ? <ListComponent address={user?.wallet?.address} /> : null}
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          open={open}
          onClose={handleClose}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={open}>
            <Box sx={style}>
              <Typography id="transition-modal-title" variant="h6" component="h2" sx={{ fontWeight: "800", textAlign: "center" }}>
                Creating your account and deploying the Smart Contract Database in Polygon Mumbai!
              </Typography>
              <Typography id="transition-modal-description" sx={{ mt: 2, textAlign: "center" }}>
                This could take between <strong> 15 to 30 seconds</strong> depending on the network congestion. Please <strong>don’t close the window.</strong>
              </Typography>
              <Loader />
            </Box>
          </Fade>
        </Modal>
        <Footer contractAddress={contractAddress} />
        {/* </WagmiConfig> */}
      </div>
    </ApolloProvider>
  );
}