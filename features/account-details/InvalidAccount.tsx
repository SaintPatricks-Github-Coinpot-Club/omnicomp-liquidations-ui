import { Box, Typography } from "@material-ui/core";

const InvalidAccount = () => {
  return (
    <Box py={2} textAlign="center">
      <Typography>
        <i>No Result Found for this Account</i>
      </Typography>
    </Box>
  );
};
export default InvalidAccount;
