/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";
import { Link } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import { connect } from "react-redux";
import { toAbsoluteUrl } from "../../../_metronic";
import HeaderDropdownToggle from "../content/CustomDropdowns/HeaderDropdownToggle";
import * as perfilStore from "../../store/ducks/perfil.duck";
import { removeAllLocalStorageCustomDatagrid } from '../../../_metronic/utils/securityUtils';
import { injectIntl } from "react-intl";

class UserProfile extends React.Component {

  render() {

    const { user, showHi, showBadge, perfil, perfiles, setPerfilActual, intl } = this.props;
    const establecerPerfil = (IdCliente, IdDivision, Cliente, Division, IdPerfil, Perfil) => {
      const perfilSeleccionado = {
        IdCliente,
        IdDivision,
        Cliente,
        Division,
        IdPerfil,
        Perfil
      };
      setPerfilActual(perfilSeleccionado);
    };
    //funcion ReaLoad
    const reLoadPage = () => {
      setTimeout(() => window.location.reload(), 400);
    }
    function truncate(str, limit) {
      return (str.length < limit) ? str : str.substring(0, limit).replace(/\w{3}$/gi, '...');
    }
    var menuPerfiles = perfiles.map(perfilItem => {
      const { IdCliente, IdDivision, Cliente, Division, IdPerfil, Perfil } = perfilItem;
      let handleClick = () => {
        establecerPerfil(IdCliente, IdDivision, Cliente, Division, IdPerfil, Perfil);


        /********************************************************** */
        removeAllLocalStorageCustomDatagrid();
        setTimeout(() => window.location.reload(), 400);
        /********************************************************** */
      };
      return (
        <>
          <a
            className="kt-notification__item"
            key={`${perfilItem.IdDivision}-${perfilItem.IdCliente}`}
            href="#"
            value={`${perfilItem.IdDivision}-${perfilItem.IdCliente}`}
            onClick={handleClick}
          >
            <div className="kt-notification__item-icon">
              {perfilItem.IdDivision == perfil.IdDivision && perfilItem.IdCliente == perfil.IdCliente && (
                <i className="flaticon2-check-mark kt-font-success" />
              )}
            </div>
            <div className="kt-notification__item-details">
              <div className="kt-notification__item-title kt-font-bold">{`${perfilItem.Division}`}</div>
            </div>
          </a>
        </>
      );
    });

    return (
      <Dropdown className="kt-header__topbar-item kt-header__topbar-item--user" drop="down" alignRight>
        <Dropdown.Toggle as={HeaderDropdownToggle} id="dropdown-toggle-user-profile">
          {showHi && <span className="kt-header__topbar-welcome kt-hidden-mobile"></span>}

          {showHi && (
            <div>
              <div className="text-right">
                <span className="kt-header__topbar">
                  <div style={{
                    display: 'flex',
                    fontSize: '12px',
                    color: 'rgb(0 0 0)',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    alignItems: 'center',
                    padding: '0 0.55rem 0 0'
                  }}>
                    {truncate(`${user.username}`, 51)}
                  </div>
                </span>
              </div>
            </div>
          )}
          {showBadge && (
            <span className="kt-badge kt-badge--lg kt-badge--rounded kt-badge--bold kt-font-success"
              style={{ background: '#000000' }}>
              {`${user.firstName}`.slice(0, 1)}
            </span>
          )}
        </Dropdown.Toggle>
        <Dropdown.Menu className="dropdown-menu dropdown-menu-fit dropdown-menu-right dropdown-menu-anim dropdown-menu-top-unround dropdown-menu-xl">
          <div
            className="kt-user-card kt-user-card--skin-dark kt-notification-item-padding-x"
            style={{
              backgroundImage: `url(${toAbsoluteUrl("/media/misc/bg-1.jpg")})`
            }}
          >
            <div className="kt-user-card__avatar">
              <img alt="Pic" className="kt-hidden" src={user.pic} />
              <span className="kt-badge kt-badge--lg kt-badge--rounded kt-badge--bold kt-font-success">
                {`${user.firstName}`.slice(0, 1)}
              </span>
            </div>

            <div className="kt-user-card__name" style={{ color: `#ffbf00` }}>
              {`${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()}`}
              <br />
              <h6 style={{ color: `white` }}>
                {`(${perfil.Perfil})`}
              </h6>
            </div>

          </div>

          <div className="kt-notification">
            <div className="kt-notification__item-details" style={{
              position: 'relative',
              top: '13px',
              left: '16px',
              marginBottom: '16px',
            }}>
              <div className="kt-notification__item-title kt-font-bold"> {`${perfil.Cliente}`}</div>
            </div>

            {menuPerfiles}
            <div className="kt-notification__custom" >
              <Link to="/logout" className="btn btn-label-brand btn-sm btn-bold" style={{ marginRight: '6rem', width: "10rem" }}>
                {intl.formatMessage({ id: "COMMON.LOGOUT" })}
              </Link>
              <Link to="/seguridad/usuarioLogin" onClick={() => reLoadPage()} className="classCerrarSesion" style={{ width: "10rem" }}>
                {intl.formatMessage({ id: "COMMON.SECURITY" })}
                &nbsp; <i className="dx-icon dx-icon-key"></i>
              </Link>
            </div>

          </div>

        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

const mapStateToProps = store => {
  return {
    user: store.auth.user,
    perfil: store.perfil.perfilActual,
    perfiles: store.perfil.perfiles
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setPerfilActual: data => dispatch(perfilStore.actions.setPerfilActual(data))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(UserProfile));