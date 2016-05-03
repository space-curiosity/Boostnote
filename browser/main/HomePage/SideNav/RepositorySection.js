import React, { PropTypes } from 'react'
import CSSModules from 'browser/lib/CSSModules'
import styles from './RepositorySection.styl'
import Repository from 'browser/lib/Repository'

const electron = require('electron')
const { remote } = electron
const Menu = remote.Menu
const MenuItem = remote.MenuItem

class RepositorySection extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      isOpen: true,
      isCreatingFolder: false,
      isSaving: false,
      newFolder: {
        name: ''
      }
    }
  }

  getRepository () {
    let { repository } = this.props
    return Repository.find(repository.key)
  }

  handleUnlinkButtonClick () {
    let { dispatch, repository } = this.props

    this.getRepository()
      .then((repositoryInstance) => {
        return repositoryInstance.unmount()
      })
      .then(() => {
        dispatch({
          type: 'REMOVE_REPOSITORY',
          key: repository.key
        })
      })
  }

  handleToggleButtonClick (e) {
    this.setState({
      isOpen: !this.state.isOpen
    })
  }

  handleContextButtonClick (e) {
    var menu = new Menu()
    menu.append(new MenuItem({
      label: 'New Folder',
      click: () => this.handleNewFolderButtonClick()
    }))
    menu.append(new MenuItem({ type: 'separator' }))
    menu.append(new MenuItem({
      label: 'Unmount',
      click: () => this.handleUnlinkButtonClick()
    }))

    menu.popup(remote.getCurrentWindow())
  }

  handleNewFolderButtonClick (e) {
    this.setState({
      isCreatingFolder: true,
      newFolder: {
        name: 'New Folder'
      }
    }, () => {
      this.refs.nameInput.select()
      this.refs.nameInput.focus()
    })
  }

  handleNewFolderFormChange (e) {
    let newFolder = this.state.newFolder
    newFolder.name = this.refs.nameInput.value

    this.setState({
      newFolder
    })
  }

  handleNameInputBlur (e) {
    let { dispatch, repository } = this.props

    this.getRepository()
      .then((repositoryInstance) => {
        return repositoryInstance.addFolder({
          name: this.state.newFolder.name
        })
      })
      .then((folder) => {
        console.log(folder)
        dispatch({
          type: 'ADD_FOLDER',
          key: repository.key,
          folder: folder
        })

        this.setState({
          isCreatingFolder: false,
          isSaving: false
        })
      })
  }

  render () {
    let { repository } = this.props

    let folderElements = repository.folders.map((folder) => {
      return (
        <div
          key={folder.key}
          styleName='folder'
        >
          <div styleName='folder-label'>
            <i className='fa fa-cube' style={{color: folder.color}}/> {folder.name}
          </div>
          <div styleName='folder-control'>
            <button styleName='folder-control-button'>
              <i className='fa fa-ellipsis-v'/>
            </button>
          </div>
        </div>
      )
    })

    let toggleButtonIconClassName = this.state.isOpen
      ? 'fa fa-minus'
      : 'fa fa-plus'

    return (
      <div
        className='RepositorySection'
        styleName='root'
      >
        <div styleName='header'>
          <div styleName='header-name'>
            <i className='fa fa-archive'/> {repository.name}
          </div>

          <div styleName='header-control'>
            <button styleName='header-control-button'
              onClick={(e) => this.handleContextButtonClick(e)}
            >
              <i className='fa fa-ellipsis-v'/>
            </button>
            <button styleName='header-control-button'
              onClick={(e) => this.handleToggleButtonClick(e)}
            >
              <i className={toggleButtonIconClassName}/>
            </button>
          </div>
        </div>
        {this.state.isOpen && <div>
          {folderElements}

          {this.state.isCreatingFolder
            ? <div styleName='newFolderForm'>
              <input styleName='newFolderForm-nameInput'
                ref='nameInput'
                value={this.state.newFolder.name}
                onChange={(e) => this.handleNewFolderFormChange(e)}
                onBlur={(e) => this.handleNameInputBlur(e)}
              />
            </div>
            : <button styleName='newFolderButton'
              onClick={(e) => this.handleNewFolderButtonClick(e)}
            >
              <i className='fa fa-plus'/> New Folder
            </button>
          }
        </div>}
      </div>
    )
  }
}

RepositorySection.propTypes = {
  repository: PropTypes.shape({
    name: PropTypes.string,
    folders: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string
    }))
  }),
  dispatch: PropTypes.func
}

export default CSSModules(RepositorySection, styles)