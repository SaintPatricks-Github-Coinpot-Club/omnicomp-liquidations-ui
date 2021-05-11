import { Box, Typography } from "@material-ui/core";

const NoAccountData = () => {
  return (
    <Box py={2} textAlign="center">
      <Typography>
        <i>No Asset Minted by this Account</i>
      </Typography>
    </Box>
  );
};
export default NoAccountData;
