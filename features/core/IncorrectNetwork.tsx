import { Box, Typography } from "@material-ui/core";

const IncorrectNetwork = () => {
  return (
    <Box py={2} textAlign="center">
      <Typography>
        <i>Please switch to BSC Mainnet.</i>
      </Typography>
    </Box>
  );
};

export default IncorrectNetwork;
