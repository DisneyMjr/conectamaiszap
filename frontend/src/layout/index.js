import React, { useState, useContext, useEffect, useMemo } from "react";
import clsx from "clsx";
import moment from "moment";
import { isNill } from "lodash"
import SoftPhone from 'react-softphone'
import { WebSocketInterface } from 'jssip';

import {
  makeStyles,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  MenuItem,
  IconButton,
  Menu,
  useTheme,
  useMediaQuery,
  Avatar,
  FormControl,
  Badge,
  withStyles,
} from "@material-ui/core";

import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import AccountCircle from "@material-ui/icons/AccountCircle";
import Cached from "@material-ui/icons/Cached";
import whatsappIcon from '../assets/nopicture.png';

import MainListItems from "./MainListItems";
import NotificationsPopOver from "../components/NotificationsPopOver";
import NotificationsVolume from "../components/NotificationsVolume";
import UserModal from "../components/UserModal";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import DarkMode from "../components/DarkMode";
import { i18n } from "../translate/i18n";
import toastError from "../errors/toastError";
import AnnouncementsPopover from "../components/AnnouncementsPopover";

import logo from "../assets/logo.png";
import { socketConnection } from "../services/socket";
import ChatPopover from "../pages/Chat/ChatPopover";

import { useDate } from "../hooks/useDate";
import UserLanguageSelector from "../components/UserLanguageSelector";

import ColorModeContext from "../layout/themeContext";
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import { getBackendUrl } from "../config";

const backendUrl = getBackendUrl();

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({

  root: {
    display: "flex",
    height: "100vh",
    backgroundColor: theme.palette.fancyBackground,
    '& .MuiButton-outlinedPrimary': {
      color: theme.mode === 'light' ? '#065183' : '#FFF',
      border: theme.mode === 'light' ? '1px solid rgba(0 124 102)' : '1px solid rgba(255, 255, 255, 0.5)',
    },
    '& .MuiTab-textColorPrimary.Mui-selected': {
      color: theme.mode === 'light' ? '#065183' : '#FFF',
    }
  },
  toolbar: {
    paddingRight: 24,
    color: theme.palette.dark.main,
    background: theme.palette.barraSuperior,
    [theme.breakpoints.down("sm")]: {
      paddingLeft: 10,
      paddingRight: 10,
      minHeight: 56
    }
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.down("sm")]: {
      position: "fixed",
      width: "100%",
      zIndex: 1200 // Ajustado para um valor menor que o Menu
    }
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0,
      width: "100%"
    }
  },
  menuButton: {
    marginRight: 36,
    [theme.breakpoints.down("sm")]: {
      marginRight: 10
    }
  },
  menuButtonHidden: {
    display: "none",
    [theme.breakpoints.down("sm")]: {
      display: "inline-flex" // Garante que o botão apareça no mobile mesmo quando o menu está aberto
    }
  },
  drawerPaper: {
    position: "fixed",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    height: "100vh",
    [theme.breakpoints.up("sm")]: {
      position: "relative" // Volta para relative em desktop
    }
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
    [theme.breakpoints.down("sm")]: {
      width: 0,
      display: "none"
    }
  },
  content: {
    flex: 1,
    overflow: "auto",
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0,
      marginTop: 56,
      width: "100%",
      height: "calc(100% - 56px)",
    },
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(9),
    }
  },



  avatar: {
    width: "100%",
  },

  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "#FFF",
    backgroundSize: "cover",
    padding: "0 8px",
    minHeight: "48px",
    [theme.breakpoints.down("sm")]: {
      minHeight: "56px",
      width: "100%"
    }
  },


  title: {
    flexGrow: 1,
    fontSize: 14,
    color: "white",
    [theme.breakpoints.down("sm")]: {
      fontSize: 13
    }
  },
  userMenu: {
    zIndex: 1300, // Garante que o menu fique acima da AppBar
    [theme.breakpoints.down("sm")]: {
      position: "fixed",
      top: "56px", // Altura da AppBar no mobile
      right: 0
    }
  },

  appBarSpacer: {
    minHeight: "48px",
    [theme.breakpoints.down("sm")]: {
      minHeight: "56px"
    }
  },

  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column"
  },
  containerWithScroll: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  NotificationsPopOver: {
    // color: theme.barraSuperior.secondary.main,
  },
  logo: {
    width: "100%",
    height: "48px",
    maxWidth: 180,
    [theme.breakpoints.down("sm")]: {
      height: "40px",
      margin: "8px 0"
    },
    logo: theme.logo
  },
  avatar2: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    cursor: 'pointer',
    borderRadius: '50%',
    border: '2px solid #ccc',
  },
  updateDiv: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

const StyledBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: '$ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}))(Badge);

const SmallAvatar = withStyles((theme) => ({
  root: {
    width: 22,
    height: 22,
    border: `2px solid ${theme.palette.background.paper}`,
  },
}))(Avatar);

const LoggedInLayout = ({ children, themeToggle }) => {
  const classes = useStyles();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleLogout, loading } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState("permanent");
  const { user } = useContext(AuthContext);

  const theme = useTheme();
  const { colorMode } = useContext(ColorModeContext);
  const greaterThenSm = useMediaQuery(theme.breakpoints.up("sm"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [volume, setVolume] = useState(localStorage.getItem("volume") || 1);

  const { dateToClient } = useDate();
  const [profileUrl, setProfileUrl] = useState(null);

  const mainListItems = useMemo(() => <MainListItems drawerOpen={drawerOpen} collapsed={!drawerOpen} />, [user, drawerOpen]);

  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 600;
      
      if (isMobileView) {
        setDrawerVariant("temporary");
        setDrawerOpen(false);
      } else {
        setDrawerVariant("permanent");
        setDrawerOpen(user.defaultMenu !== "closed");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [user]);

  useEffect(() => {
    if (document.body.offsetWidth > 600) {
      if (user.defaultMenu === "closed") {
        setDrawerOpen(false);
      } else {
        setDrawerOpen(true);
      }
    }
    if (user.defaultTheme === "dark" && theme.mode === "light") {
      toggleColorMode();
    }
  }, [user]);

  useEffect(() => {
    if (document.body.offsetWidth < 600) {
      setDrawerVariant("temporary");
    } else {
      setDrawerVariant("permanent");
    }
  }, [drawerOpen]);

  useEffect(() => {
    const companyId = user.companyId;
    const userId = user.id;

    const socket = socketConnection({ companyId, userId: user.id });
    const ImageUrl = user.profileImage;
    if (ImageUrl !== undefined && ImageUrl !== null)
      setProfileUrl(`${backendUrl}/public/company${companyId}/user/${ImageUrl}`);
    else 
      setProfileUrl(`${process.env.FRONTEND_URL}/nopicture.png`)

    socket.on(`company-${companyId}-auth`, (data) => {
      if (data.user.id === +userId) {
        toastError("Sua conta foi acessada em outro computador.");
        setTimeout(() => {
          localStorage.clear();
          window.location.reload();
        }, 1000);
      }
    });

    socket.emit("userStatus");
    const interval = setInterval(() => {
      socket.emit("userStatus");
    }, 1000 * 60 * 5);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [user]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };

  const handleClickLogout = () => {
    if (theme.mode === "dark") toggleColorMode();
    handleCloseMenu();
    handleLogout();
  };

  const drawerClose = () => {
    if (isMobile || user.defaultMenu === "closed") {
      setDrawerOpen(false);
    }
  };

  const handleRefreshPage = () => {
    window.location.reload(false);
  };

  const handleMenuItemClick = () => {
    const { innerWidth: width } = window;
    if (width <= 600) {
      setDrawerOpen(false);
    }
  };

  const toggleColorMode = () => {
    colorMode.toggleColorMode();
  };

  if (loading) {
    return <BackdropLoading />;
  }

  return (
    <div className={classes.root}>
      <Drawer
        variant={isMobile ? "temporary" : drawerVariant}
        classes={{
          paper: clsx(
            classes.drawerPaper,
            !drawerOpen && classes.drawerPaperClose
          ),
        }}
        open={drawerOpen}
        onClose={() => isMobile && setDrawerOpen(false)}
      >
        <div className={classes.toolbarIcon}>
          <img src={logo} style={{ display: "block", margin: "0 auto", height: "100%", width: "auto", maxWidth: "100%" }} alt="logo" />
          <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <List className={classes.containerWithScroll}>
          {mainListItems}
        </List>
        <Divider />
      </Drawer>

      <AppBar
        position={isMobile ? "fixed" : "absolute"}
        className={clsx(classes.appBar, drawerOpen && !isMobile && classes.appBarShift)}
      >
        <Toolbar variant={isMobile ? "regular" : "dense"} className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={clsx(classes.menuButton, !isMobile && drawerOpen && classes.menuButtonHidden)}
          >
            <MenuIcon style={{ color: "white" }} />
          </IconButton>

          <Typography
            component="h2"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            {greaterThenSm && user?.profile === "admin" && user?.company?.dueDate ? (
              <>
                {i18n.t("mainDrawer.appBar.user.message")} <b>{user.name}</b>, {i18n.t("mainDrawer.appBar.user.messageEnd")} <b>{user?.company?.name}</b>! ({i18n.t("mainDrawer.appBar.user.active")} {dateToClient(user?.company?.dueDate)})
              </>
            ) : (
              <>
                {i18n.t("mainDrawer.appBar.user.message")} <b>{user.name}</b>, {i18n.t("mainDrawer.appBar.user.messageEnd")} <b>{user?.company?.name}</b>!
              </>
            )}
          </Typography>

          {<UserLanguageSelector />}

          <IconButton edge="start" onClick={toggleColorMode}>
            {theme.mode === 'dark' ? 
              <Brightness7Icon style={{ color: "white" }} /> : 
              <Brightness4Icon style={{ color: "white" }} />
            }
          </IconButton>

          <NotificationsVolume
            setVolume={setVolume}
            volume={volume}
          />

          <IconButton
            onClick={handleRefreshPage}
            aria-label={i18n.t("mainDrawer.appBar.refresh")}
            color="inherit"
          >
            <Cached style={{ color: "white" }} />
          </IconButton>

          {user.id && <NotificationsPopOver volume={volume} />}

          <AnnouncementsPopover />

          <ChatPopover />

          <div>
            <StyledBadge
              overlap="circular"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              variant="dot"
              onClick={handleMenu}
            >
              <Avatar alt="Multi100" className={classes.avatar2} src={profileUrl} />
            </StyledBadge>

            <UserModal
              open={userModalOpen}
              onClose={() => setUserModalOpen(false)}
              onImageUpdate={(newProfileUrl) => setProfileUrl(newProfileUrl)}
              userId={user?.id}
            />

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={menuOpen}
              onClose={handleCloseMenu}
              className={classes.userMenu}
              style={{ 
                zIndex: 9999 
              }}
              PopoverClasses={{
                root: classes.userMenu
              }}
            >
              <MenuItem onClick={handleOpenUserModal}>
                {i18n.t("mainDrawer.appBar.user.profile")}
              </MenuItem>
              <MenuItem onClick={handleClickLogout}>
                {i18n.t("mainDrawer.appBar.user.logout")}
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      <main className={clsx(classes.content, {
        [classes.contentShift]: drawerOpen && !isMobile
      })}>
        <div className={classes.appBarSpacer} />
        {children}
      </main>
    </div>
  );
}

export default LoggedInLayout;