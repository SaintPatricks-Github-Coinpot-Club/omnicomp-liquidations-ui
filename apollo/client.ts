import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";

const omnicompLink = new HttpLink({
  uri: "https://gq-omnicomp.ocp.finance",
});

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: omnicompLink
});
