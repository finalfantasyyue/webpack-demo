'use strict';

import React from 'react'
import ReactDom from 'react-dom'
import browser from './assets/images/brower.jpg'
import './index.less'

class Index extends React.Component {
  render() {
    return <div class="search-text">
      Search Text
      <img src={ browser } width="200" height="150" alt="browser"/>
    </div>
  }
}

ReactDom.render(
  <Index />,
  document.getElementById('app')
)