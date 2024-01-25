import React, { Component } from "react";
import * as auth from "../../store/ducks/auth.duck";
import { connect, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import { LayoutSplashScreen } from "../../../_metronic";
import { removeAllLocalStorageCustomDatagrid } from '../../../_metronic/utils/securityUtils';
import { actions } from "../../store/ducks/auth.duck";
// import { actions as actionsScreen } from "../../store/ducks/screenlock.duck";
class Logout extends Component {
  componentDidMount() {
    /********************************************************** */
    removeAllLocalStorageCustomDatagrid(); //Comentado por Fabiola: 2021-08-10
    /********************************************************** */
    //console.log(this.user);
    this.props.stopScreenLock(0);
    let usuario = (this.props.user != undefined) ? this.props.user.username : "2Personnel";
    this.props.logout({ IdUsuario: usuario });
  }

  render() {
    const { hasAuthToken } = this.props;

    return hasAuthToken ? <LayoutSplashScreen /> : <Redirect to="/auth" />;
  }
}

const mapStateToProps = store => {
  return {
    hasAuthToken: Boolean(store.auth.authToken),
    user: (store.auth.user || { username: '2Personnel' }) 
  };
};

const mapDispatchToProps = dispatch => {
  return {
    logout: data => dispatch(actions.logout(data)),
    stopScreenLock: data => dispatch(actions.setInitScreenLock(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Logout);


// export default connect(
//   ({ auth }) => ({
//     hasAuthToken: Boolean(auth.authToken),
//     user: (auth.user || { username: '2Personnel' })
//   }),
//   auth.actions
// )(Logout);
