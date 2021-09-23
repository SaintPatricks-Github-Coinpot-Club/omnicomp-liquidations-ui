import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const omnicompLink = new HttpLink({
  uri: "https://api.thegraph.com/subgraphs/name/omni-corp-protocols/omnivault-puffcake",
});

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: omnicompLink,
});
