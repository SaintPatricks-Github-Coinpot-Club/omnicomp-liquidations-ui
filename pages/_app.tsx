import App from "next/app";
import Head from "next/head";

import "../utils/global.css";

import { ApolloProvider } from "@apollo/client";
import { WithStylingProviders } from "../utils/styling";
import Connection from "../containers/Connection";
import SubGraph from "../containers/SubGraph";
import AccountAddress from "../containers/AccountAddress";
import ProtocolState from "../containers/ProtocolState";

import { client } from "../apollo/client";

interface IProps {
  children: React.ReactNode;
}

const WithStateContainerProviders = ({ children }: IProps) => (
  <ApolloProvider client={client}>
    <Connection.Provider>
      <SubGraph.Provider>
        <AccountAddress.Provider>
          <ProtocolState.Provider>{children}</ProtocolState.Provider>
        </AccountAddress.Provider>
      </SubGraph.Provider>
    </Connection.Provider>
  </ApolloProvider>
);

export default class MyApp extends App {
  componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles?.parentNode?.removeChild(jssStyles);
    }
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <>
        <Head>
          <title>OmniCOMP</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,700;1,400&display=swap"
            rel="stylesheet"
          />
          <link rel="icon" type="image/x-icon" href="favicon.png" />
        </Head>

        <WithStylingProviders>
          <WithStateContainerProviders>
            <Component {...pageProps} />
          </WithStateContainerProviders>
        </WithStylingProviders>
      </>
    );
  }
}
