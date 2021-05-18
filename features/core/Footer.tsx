import { Box, IconButton } from "@material-ui/core";

const Footer = () => {
  return (
    <Box py={4} textAlign="center">
      <IconButton
        style={{ marginRight: `8px` }}
        target="_blank"
        href="https://github.com/omni-corp-protocols/omnicomp-liquidations-ui"
        size="medium"
      >
        <img
          src="/social-media-icons/github.png"
          className="social-media-icons"
        />
      </IconButton>
      <IconButton
        style={{ marginRight: `8px` }}
        target="_blank"
        href="https://twitter.com/omnic_pro"
        size="medium"
      >
        <img
          src="/social-media-icons/twitter.png"
          className="social-media-icons"
        />
      </IconButton>
      {/* <IconButton
        style={{ marginRight: `8px` }}
        target="_blank"
        href=""
        size="medium"
      >
        <img
          src="/social-media-icons/discord.png"
          className="social-media-icons"
        />
      </IconButton> */}
      <IconButton
        style={{ marginRight: `8px` }}
        target="_blank"
        href="https://t.me/ocpcorp"
        size="medium"
      >
        <img
          src="/social-media-icons/telegram.png"
          className="social-media-icons"
        />
      </IconButton>
      {/* <IconButton
        style={{ marginRight: `8px` }}
        target="_blank"
        href=""
        size="medium"
      >
        <img
          src="/social-media-icons/medium.png"
          className="social-media-icons"
        />
      </IconButton> */}
    </Box>
  );
};

export default Footer;
