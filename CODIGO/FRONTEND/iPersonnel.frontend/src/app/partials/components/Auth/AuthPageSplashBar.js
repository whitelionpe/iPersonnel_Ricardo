import React, { useEffect, useState, useRef } from "react";
import { FormattedMessage } from "react-intl";
import { Popover, PopoverBody } from 'reactstrap';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Constants from "../../../store/config/Constants";
// import { MENU_PRINCIPAL } from '../../../../_metronic/utils/utils';
import LanguageSelector from "../../layout/LanguageSelector";
import HamburgerMenu from "../../content/Acreditacion/Svg/DashboardMenu/HamburgerMenu";
import { makeStyles } from '@material-ui/core/styles';

const { MENU_PRINCIPAL } = Constants;

const useStyles = makeStyles(theme => ({
  customTooltip: {
    // I used the rgba color for the standard "secondary" color
    backgroundColor: 'rgb(0 0 0 / 87%)',
  },
  customArrow: {
    color: 'rgb(71 84 137)',
  },
}));

const AuthPageSplashBar = (props) => {
  const anchorRef = useRef(null);
  const prevOpen = useRef(open);

  const [popoverOpen, setPopoverOpen] = useState(false);
  const open = props.open;
  const setOpen = props.setOpen;

  const IMG_LOGO_PRINCIPAL = "/media/iconsappv02/2personnel_principal.png";
  // const IMG_LOGO_IZQUIERDA = "/media/logos/2-Personal-logoalta.png";
  const classes = useStyles();
  const personnelLogo = "/new_logos/2personnel_Negro.svg";

  useEffect(() => {
    // if (prevOpen.current === true && open === false) {
    //   // console.log(anchorRef.current);
    //   // anchorRef.current.focus();
    // }
    prevOpen.current = open;
  }, [open]);


  const toggle = () => setPopoverOpen(!popoverOpen);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  }


  const onClickEvent = (item) => {
    setPopoverOpen(false)//OCULTA LAS OPCIONES
    if (item.activo === 1) {
      props.ejecutarAccion(item)
    }
  }

  return (

    <header className="main-header header-style-one">
      {/* <div className="header-top" style={{ padding: '5px', backgroundColor: 'rgb(100 100 100)' }}>
        <div className="auto-container">
          <div className="inner-container" >
            <div className="left-column">
              <ul className="contact-info">
                <li className="header_direccion"><a href="#"><i
                  className="pe-7s-mail-open" style={{ color: 'white' }}></i>contacto@whiteliontechnology.com</a></li>
              </ul>
            </div>
            <div className="right-column">
              <ul className="social-icon">
                <li><a href="#"><i className="fab fa-facebook-f"></i></a></li>
                <li><a href="#"><i className="fab fa-linkedin"></i></a></li>
              </ul>
            </div>
          </div>
        </div>
      </div> */}
      <div className="header-upper" >
        <div className="auto-container">
          <div style={{ height: '95px' }} className="logo_header">
            <div className="logo-box">
              <div className="logo">
                <a href="#">
                  <img src={personnelLogo} alt="principal_left" style={{ height: '55px', marginTop: '-2px', marginLeft: '-15px' }} className="logo_movil" />
                </a>
              </div>
            </div>

            {/* <div className="navbarSupported-center">
              <img className="img-logo-principal" src={IMG_LOGO_PRINCIPAL} />
            </div> */}

            <div className="right-column">
              <div className="navbar-right">

                {/* +++++++++++++++++++++++-Agregar idioma y aplicaciones-++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
                <div className="login-navbar navbar navbar-expand-lg" style={{ float: 'right' }}>
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <p className="css_title_idioma" style={{ color: 'black', textTransform: 'uppercase' }}> <FormattedMessage id="AUTH.LOGIN.LANGUAGE" /> </p>
                        </td>
                        <td>
                          <div className="css_body_idioma">
                            <LanguageSelector iconType="" />
                          </div>
                        </td>
                        <td>
                          <div className="navbarSupported-right">
                            <div className="navbarSupported-right-div-menu">
                              <Tooltip
                                id="ToolTopAuthPage"
                                classes={{
                                  tooltip: classes.customTooltip,
                                  arrow: classes.customArrow
                                }}

                                title={<h6 style={{ color: "white" }}><FormattedMessage id="APLICATION.2PERSONNEL" /> </h6>}
                                placement="botton">

                                <Button
                                  id="btnBotonMenu"
                                  ref={anchorRef}
                                  aria-controls={open ? 'menu-list-grow' : undefined}
                                  aria-haspopup="true"
                                  onClick={handleToggle}>
                                  <div className="navbarSupported-right-menu menu-bar sidemenu-nav-toggler_">
                                    <HamburgerMenu />
                                  </div>
                                </Button>

                              </Tooltip>
                              <Popover
                                placement="bottom"
                                isOpen={popoverOpen}
                                target="btnBotonMenu"
                                className="clsPopover"
                                toggle={toggle} >
                                <PopoverBody>
                                  <div className="container">
                                    <div className="row">

                                      {MENU_PRINCIPAL.map((item, index) => (
                                        <div key={index} className="col-4 custom-item-menu" onClick={() => { onClickEvent(item); }}>
                                          <div className="custom-item-menu-img">
                                            <i className={`fas icon-app-menu icon-${item.classIcon}${item.activo == 1 ? '' : '-d icon-disabled'}`} />
                                          </div>
                                          <div className="css_logo_title">
                                            <p className={`${item.activo == 1 ? '' : 'text-disabled'}`}>
                                              <FormattedMessage id={item.text} />
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </PopoverBody>
                              </Popover>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>


                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <div className="sticky-header">
        <div className="header-upper" style={{ backgroundColor: '#000000' }}>
          <div className="auto-container">
            <div className="inner-container" style={{ height: '95px' }}>
              <div className="logo-box">
                <div className="logo"><a href="#"><img src="template_01/assets/images/logos/logo_ipersonnel_peque.png" alt=""
                  style={{ height: '55px' }} /></a>
                </div>
              </div>
              <div className="right-column">
                <div className="nav-outer">
                  <div className="mobile-nav-toggler">
                    <img src="template_01/assets/images/icons/icon-bar-2.png" alt="" />
                  </div>
                  <nav className="main-menu navbar-expand-md navbar-light">
                  </nav>
                </div>
                <div className="navbar-right">
                  <button type="button" className="menu-bar sidemenu-nav-toggler" style={{ background: 'rgb(100 100 100)' }}>
                    <i className="pe-7s-users" style={{ fontSize: '40px', lineHeight: 'unset', color: 'white' }}></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mobile-menu">
        <div className="menu-backdrop"></div>
        <div className="close-btn"><span className="icon flaticon-remove"></span></div>
        <nav className="menu-box">
          <div className="nav-logo"><a href="#"><img src="template_01/assets/images/logo.png" alt="" title="" /></a>
          </div>
          <div className="menu-outer">
          </div>
          <div className="social-links">
            <ul className="clearfix">
              <li><a href="#"><span className="fab fa-linkedin"></span></a></li>
              <li><a href="#"><span className="fab fa-facebook-square"></span></a></li>
            </ul>
          </div>
        </nav>
      </div>
      <div className="nav-overlay">
        <div className="cursor"></div>
        <div className="cursor-follower"></div>
      </div>
    </header>
  );
};

export default AuthPageSplashBar;
