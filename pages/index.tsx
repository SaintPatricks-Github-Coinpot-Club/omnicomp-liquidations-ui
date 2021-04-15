import { Container, Box } from "@material-ui/core";

import Connection from "../containers/Connection";

import Header from "../features/core/Header";
import Footer from "../features/core/Footer";
import NoWalletConnection from "../features/core/NoWalletConnection";
import IncorrectNetwork from "../features/core/IncorrectNetwork";
import AllAccounts from "../features/all-accounts/AllAccounts";

export default function Index() {
  const { network, userAddress } = Connection.useContainer();

  if (!userAddress) {
    return (
      <Container maxWidth={"md"}>
        <Box py={4}>
          <Header />
          <NoWalletConnection />
          <Footer />
        </Box>
      </Container>
    );
  } else if (network?.chainId !== 56) {
    return (
      <Container maxWidth={"md"}>
        <Box py={4}>
          <Header />
          <IncorrectNetwork />
          <Footer />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box py={4}>
        <Header />
        <AllAccounts />
        <Footer />
      </Box>
    </Container>
  );
}
