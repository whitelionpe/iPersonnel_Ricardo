import React, { useState } from "react"
import { injectIntl } from "react-intl"
import { FormattedMessage } from "react-intl";
import LanguageSelector from "../../partials/layout/LanguageSelector";
import { Button, List, ListItem, ListItemText, DialogTitle, IconButton, Drawer } from "@material-ui/core";
import HamburgerMenu from "../../partials/content/Acreditacion/Svg/DashboardMenu/HamburgerMenu";
import Constants from "../../store/config/Constants";
const { MENU_PRINCIPAL } = Constants;

function LoginTopBar(props) {
  const { intl, handleAcreditacionChange, style, btnIniciarOpenDrawer = false, setBtnIniciarOpenDrawer } = props
  const [state, setState] = React.useState(false);

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setState(prevState => !prevState);
  };

  React.useEffect(() => {

    if (btnIniciarOpenDrawer) {
      setState(true)
      setBtnIniciarOpenDrawer(false)
    }
  }, [btnIniciarOpenDrawer, setBtnIniciarOpenDrawer])
  //************************ ADD **************************** */
  const onClickEvent = (item) => {
    const { locale } = intl;
    if (item.activo === 1) {
      if (item.accion === null) {
        handleAcreditacionChange()
      } else {
        window.open(item.accion + 'auth/login?int=' + locale, '_blank');
      }
    }
  }

  const list = (anchor) => (
    <div
      style={{
        width: "220px",
        backgroundColor: "#141516",
        color: "#fff",
        height: "inherit",
        // paddingTop:"50px"
      }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>

        {MENU_PRINCIPAL.map((menuOption, index) => (
          <ListItem button key={menuOption.text} onClick={() => { onClickEvent(menuOption); }} style={{
            margin: "0 auto",
            borderBottom: "1px solid white",
            width: "80%",
            display: "flow",
            paddingTop: "20px",
          }}>
            {menuOption.icon}
            <ListItemText primary={intl.formatMessage({ id: menuOption.text })} className="clsTamanoLetraMenu" style={{ textAlign: "center", fontSize: "15px", fontWeight: "600", lineHeight: "24px", letterSpacing: "0.75px" }} />
          </ListItem>
        ))}

      </List>
    </div>
  );


  return (
    <div className="loginTopBar" style={style}>
      <div style={{ position: "absolute", right: "105px", top: "12px", }}>
        {/* <p className="css_title_idioma">
          <FormattedMessage id="AUTH.LOGIN.LANGUAGE" />
        </p> */}
      </div>
      <div style={{ position: "absolute", right: "79px", top: "30px" }}>
        <div className="css_body_idioma">
          <LanguageSelector iconType="" />
        </div>
      </div>
      <div style={{ position: "absolute", right: "18px", top: "22px", }}>
        <Button onClick={toggleDrawer("right", true)} style={{ boxShadow: "none" }}><HamburgerMenu /></Button>

        <Drawer
          anchor="right"
          open={state}
          onClose={toggleDrawer("right", false)}>
          <DialogTitle disableTypography className="drawerTitle" style={{ background: "#141516" }}>
            <IconButton style={{ float: "right" }} onClick={toggleDrawer("right", false)}>
              <i className="dx-icon-close" style={{ color: "#fff" }}></i>
            </IconButton>
          </DialogTitle>
          {list("right")}
        </Drawer>

      </div>
    </div>
  )
}

export default injectIntl(LoginTopBar)
