import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
} from "@apollo/client";

// const omnicompLink = new HttpLink({
//   uri:
//     "https://api.thegraph.com/subgraphs/name/omni-corp-protocols/omnicomp-v2",
// });

const omnicompLinkBsc = new HttpLink({
  uri:
    "https://api.thegraph.com/subgraphs/name/omni-corp-protocols/omnicomp-v2",
});

const omnicompLinkPolygon = new HttpLink({
  uri:
    "https://api.thegraph.com/subgraphs/name/omni-corp-protocols/omnicomp-v2",
});

// Uses ApolloLink's directional composition logic, docs: https://www.apollographql.com/docs/react/api/link/introduction/#directional-composition
const omnicompLinks = ApolloLink.split(
  (operation) => operation.getContext().clientName === "OMNICOMP",
  omnicompLinkBsc,
  omnicompLinkPolygon
);

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: omnicompLinks,
});
