import React, { PropTypes } from 'react'
import Relay from 'react-relay'
import mapProps from 'map-props'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import Icon from 'components/Icon/Icon'
import NewFieldOverlay from 'components/NewFieldOverlay/NewFieldOverlay'
import AddFieldMutation from 'mutations/AddFieldMutation'
import DeleteFieldMutation from 'mutations/DeleteFieldMutation'
import classes from './SchemaTab.scss'

export default class SchemaTab extends React.Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    fields: PropTypes.array.isRequired,
    allModels: PropTypes.array.isRequired,
  };

  constructor (props) {
    super(props)

    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)

    this._toggleOverlay = ::this._toggleOverlay
    this._addField = ::this._addField

    this.state = {
      overlayVisibile: false,
    }
  }

  _toggleOverlay () {
    this.setState({ overlayVisibile: !this.state.overlayVisibile })
  }

  _addField (data) {
    Relay.Store.commitUpdate(new AddFieldMutation({
      ...data,
      modelId: this.props.params.modelId,
      projectId: this.props.params.projectId,
    }))
  }

  _deleteField (field) {
    if (window.confirm(`Do you really want to delete "${field.fieldName}"?`)) {
      Relay.Store.commitUpdate(new DeleteFieldMutation({
        fieldId: field.id,
        projectId: this.props.params.projectId,
        modelId: this.props.params.modelId,
      }))
    }
  }

  render () {
    const modelNames = this.props.allModels.map((model) => model.name)

    return (
      <div className={classes.root}>
        {this.state.overlayVisibile &&
          <NewFieldOverlay
            modelNames={modelNames}
            hide={this._toggleOverlay}
            add={this._addField}
            />
        }
        <div onClick={this._toggleOverlay} className={classes.add}>+ Add field</div>
        <table className={classes.table}>
          <thead>
            <tr>
              <th>Fieldname</th>
              <th>Type</th>
              <th>Required</th>
              <th>Unique</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.props.fields
              .map((field) => (
                <tr key={field.fieldName} className={field.isSystem ? classes.disabled : ''}>
                  <td>{field.fieldName}</td>
                  <td>
                    <span className={classes.type}>
                      {field.typeIdentifier}<span className={classes.cardinality}>{field.isList ? 'many' : 'one'}</span>
                    </span>
                  </td>
                  <td>{field.isRequired ? 'required' : ''}</td>
                  <td>{field.isUnique ? 'unique' : ''}</td>
                  <td>
                    {!field.isSystem &&
                      <span onClick={() => this._deleteField(field)}>
                        <Icon src={require('assets/icons/delete.svg')} />
                      </span>
                    }
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    )
  }
}

const MappedSchemaTab = mapProps({
  params: (props) => props.params,
  allModels: (props) => props.viewer.project.models.edges.map((edge) => edge.node),
  fields: (props) => props.viewer.model.fields.edges.map((edge) => edge.node),
})(SchemaTab)

export default Relay.createContainer(MappedSchemaTab, {
  initialVariables: {
    modelId: null, // injected from router
    projectId: null, // injected from router
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        model(id: $modelId) {
          id
          name
          fields(first: 100) {
            edges {
              node {
                id
                fieldName
                typeIdentifier
                typeData
                isRequired
                isList
                isUnique
                isSystem
              }
            }
          }
        }
        project(id: $projectId) {
          models(first: 100) {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    `,
  },
})