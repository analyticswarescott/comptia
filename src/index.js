import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router'

import App        from './containers/App';
import Comparison from './pages/Comparison'
import Overview2   from './pages/Overview2'
import Overview   from './pages/Overview'
import Export     from './pages/Export'

import './index.css';
import './bootstrap.css'
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

ReactDOM.render(
    <div>
        <Router history={browserHistory}>
            <Route path="/" component={App}>
                <IndexRoute component={Overview2}/>
                <Route path="dsname(/:dsname)" component={App}  />
                <Route path="overview(/:measure)(/:aggregation)"   component={Overview2}/>
                <Route path="comparison(/:dimension)" component={Comparison}/>
                <Route path="export" component={Export}/>
            </Route>
        </Router>
    </div>
, document.getElementById('root'))
