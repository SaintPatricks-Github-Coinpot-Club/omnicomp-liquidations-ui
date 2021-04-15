import { Box, Typography } from "@material-ui/core";

const NoWalletConnection = () => {
  return (
    <Box py={2} textAlign="center">
      <Typography>
        <i>Please connect your Wallet.</i>
      </Typography>
    </Box>
  );
};

export default NoWalletConnection;
