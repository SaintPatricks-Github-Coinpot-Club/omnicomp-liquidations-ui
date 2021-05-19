import styled from "styled-components";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";

import Connection from "../../containers/Connection";

interface IProps {
  styled: {
    connected: boolean;
  };
}

const ConnectButton = styled(Button)`
  border: none;
  background: #363333;
  border-radius: 5px;
  color: #e4e5e8 !important;
  line-height: 141.44%;
  box-shadow: none;
  font-weight: 500;
  font-size: 12px;
  letter-spacing: 0;
  padding: 0.75em;
  margin-right: 2em;
  font-family: HK-modular-bold, Formular-Medium, "IBM Plex Mono",
    "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "sans-serif";
  pointer-events: ${({ styled }: IProps) =>
    styled.connected ? "none" : "unset"};
  ${({ styled }: IProps) => styled.connected && "background-color: #363333;"}
`;

const AddressBox = styled.div`
  background: #363333;
  border-radius: 5px;
  color: #e4e5e8 !important;
  line-height: 141.44%;
  box-shadow: none;
  font-weight: 500;
  font-size: 12px;
  letter-spacing: 0;
  padding: 0.75em;
  margin-right: 2em;
  font-family: HK-modular-bold, Formular-Medium, "IBM Plex Mono",
    "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "sans-serif";
`;

const Header = () => {
  const {
    connect,
    disconnect,
    signer,
    network,
    userAddress,
  } = Connection.useContainer();
  const connected = signer !== null;

  const networkName = network?.name === "homestead" ? "mainnet" : network?.name;
  const shortAddress = `${userAddress?.substr(0, 5)}…${userAddress?.substr(
    -4
  )}`;

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      style={{ margin: " 0em 0em 2em 1em" }}
    >
      <Box>
        <a href="/">
          <img src="/brand/omnicomp.png" style={{ maxWidth: "186px" }} />
        </a>
      </Box>
      <Box display="flex" alignItems="center">
        {userAddress && (
          <AddressBox title={userAddress || undefined}>
            <div>{shortAddress}</div>
          </AddressBox>
        )}
        {connected ? (
          <>
            <ConnectButton variant="outlined" styled={{ connected }}>
              <span
                style={{
                  color: "#6ecacf",
                  fontSize: "1.4em",
                  marginRight: "0.1em",
                }}
              >
                ●
              </span>
              &nbsp;
              {networkName}
            </ConnectButton>
            <AddressBox title="Click to Disconnect Wallet" onClick={disconnect}>
              <div>🦊</div>
            </AddressBox>
          </>
        ) : (
          <ConnectButton
            variant="contained"
            onClick={connect}
            styled={{ connected }}
          >
            🦊 Connect
          </ConnectButton>
        )}
      </Box>
    </Box>
  );
};

export default Header;
