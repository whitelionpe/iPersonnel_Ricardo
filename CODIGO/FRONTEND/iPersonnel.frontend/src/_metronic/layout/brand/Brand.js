/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import Grid from '@material-ui/core/Grid';
import * as builder from "../../ducks/builder";
import { toAbsoluteUrl } from "../../utils/utils";
import UserProfile from "../../../app/partials/layout/UserProfile";
import LanguageSelector from "../../../app/partials/layout/LanguageSelector";
import { withStyles } from '@material-ui/core/styles';

const useStyles = theme => ({
    centerTitle: {
        display: 'grid',
        textAlign: 'center',
        color: 'black',
    },
});

class Brand extends React.Component {
    render() {
        const { brandClasses, perfil, classes } = this.props;
        const style = { color: "#fbfbff", textAlign: "center", marginRight: "-120px" };
        return (
            <>
                <Grid container spacing={3}>
                    <Grid item xs={4}>
                        <div className={`kt-header__brand ${brandClasses} kt-grid__item`} id="kt_header_brand">
                            <div className="kt-header__brand-logo">
                                <Link to="/">
                                    <img
                                        className="kt-header__brand-logo-default"
                                        alt="logo_desktop"
                                        style={{ height: '45px', background: '#ffbf00' }}
                                        src={toAbsoluteUrl("/new_logos/2personnel_login.svg")}
                                    />
                                </Link>
                            </div>
                        </div>
                    </Grid>
                    <Grid item xs={4}>
                        <span className={`kt-header__topbar ${classes.centerTitle}`}>
                            {process.env.REACT_APP_VIEW_OLD_TEMPLATE === 'true' ? (
                                <>
                                    <strong style={{ fontSize: '14px' }}>{`${perfil.Cliente}`}</strong>
                                    <label> {`${perfil.Division}`} </label>
                                </>
                            ) : (
                                <img
                                    className="kt-header__brand-logo-default"
                                    alt="logo_desktop"
                                    style={{ height: '45px', background: '#ffbf00' }}
                                    src={toAbsoluteUrl("/new_logos/2personnel_N_Large.svg")}
                                />
                            )}
                        </span>
                    </Grid>
                    <Grid item xs={4} style={{ position: 'absolute', right: '10px' }}>
                        <div className="kt-header__topbar">
                            <UserProfile showAvatar={false} showHi={true} showBadge={true} />
                            {/* <div className="css_body_idioma" style={{ marginTop: "5px" }}>
                                <LanguageSelector iconType="" />
                            </div> */}
                        </div>
                    </Grid>
                </Grid>
            </>
        );
    }
}

const mapStateToProps = store => {
    return {
        brandClasses: builder.selectors.getClasses(store, {
            path: "brand",
            toString: true
        }),
        //perfil: auth.perfil
        perfil: store.perfil.perfilActual
    };
};

export default connect(mapStateToProps)(withStyles(useStyles)(Brand));
