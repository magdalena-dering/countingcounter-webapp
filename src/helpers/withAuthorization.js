import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { auth } from '../firebase/index';
import * as routes from '../const/routes';

const withAuthorization = (authCondition) => (Component) => {
  class WithAuthorization extends React.Component {

    componentDidMount() {
      auth.authStateChanged(authUser => {
        if (!authCondition(authUser)) {
          this.props.history.push(routes.LOG_IN)
        }
      })
    }

    render() {
      return this.context.authUser ? <Component/> : null;
    }
  }

  WithAuthorization.contextTypes = {
    authUser: PropTypes.object,
  };

  return withRouter(WithAuthorization);
};

export default withAuthorization;