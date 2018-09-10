[![npm](https://img.shields.io/npm/dw/ra-component-factory.svg)](https://www.npmjs.com/package/ra-component-factory)
[![npm](https://img.shields.io/npm/v/ra-component-factory.svg)](https://www.npmjs.com/package/ra-component-factory)
[![npm](https://img.shields.io/npm/l/ra-component-factory.svg)](https://www.npmjs.com/package/ra-component-factory)

# ra-component-factory (former: aor-component-factory)

react-admin component-factory when used with http://github.com/marmelab/react-admin provides a centralized way to easily configure:
- permissions on action buttons (should a CreateButton be visible ?)
- permissions on Forms/Actions (should edit form of a resource be accessible to a user?)
- permissions on Menu Links (should a Menu Link be visible ?)
- permissions on front-end visibility/immutability (should a property be visible / readonly ?)
- reordering of elements in the views
- handling of tabbed views/forms
- (soon) mobile responsive view integration

### Versions

Download version ra-component-factory 0.3.0 for admin-on-rest 1.4.x

Download version ra-component-factory 0.4.0 for react-admin 2.2.x


### Installation:

```npm install ra-component-factory```

### Global Config:

Add a global Config like that (e.g config/factoryConfig.js):

```js
import postsConfig from './config/postsConfig';
export default {
	resources: {
		posts: postsConfig
	},
	roleEntryInLocalStorage: 'user_role',
	tabDelimiter: '-----TAB-----',
	editReadOnlyStartsWith: '_'
}
```

Add a config for each of the resources you want to use the factory with (e.g config/postsConfig.js). You can have all resources in the same file if you choose so. Assuming you have two roles (role1 and role2) in your app and the role of the user is found in the local Storage at `user_role` it will look like that:

```jsx
import React from 'react';
import {
     TextInput,
     TextField,
     DateInput,
     DateField,
     ReferenceInput,
     ReferenceField,
     ChipField
} from 'react-admin';

export default {
    props: {
        id: {
            input: (<TextInput source="id"/>),
            field: (<TextField source="id"/>),
        },
        name: {
            input: (<TextInput label="Name" source="name"/>),
            field: (<TextField label="Name" source="name"/>),
        },
        date: {
            input: (<DateInput source="date" parse={dateParser} label="Post Date"/>),
            field: (<DateField source="date" type="date" label="Post Date"/>),
        },
        dateGte: { //date Greater than equal
            input: (<DateInput source="dateGte" parse={dateParser} label="Date from"/>),
        },
        dateLte: { // date Less than equal
            input: (<DateInput source="dateLte" parse={dateParser} label="Date to"/>),
        },
        author: {
            input: <ReferenceInput label="Author" source="author" reference="authors" allowEmpty>
                      <SelectInput optionText="name" translate={false}/>
                   </ReferenceInput>,
            field: <ReferenceField label="Author" source="author" reference="authors" sortable={false} linkType={false} allowEmpty={true}>
                      <ChipField source="name"/>
                    </ReferenceField>
        },
    },

    role1: {
        create: {
            props: ["name", "author", "date"],
            action: true
        },
        edit: {
            props: ["_id", "name", "author", "date"],
            action: true
        },
        list: {
            props: ["id", "name", "author", "date"],
            action: true
        },
        filter: {
            props: ["q", "id", "author", "dateGte", "dateLte"],
            action: true
        },
        show: {
            props: ["id", "name", "author"],
            action: true
        },
        search: {
            action: true
        },
        delete: {
            action: true
        },

    },
    role2: {
        create: {
            props: [],
            action: false
        },
        edit: {
            props: [],
            action: false
        },
        list: {
            props: ["id", "name", "author", "date"],
            action: false
        },
        filter: {
            props: ["q", "id", "author", "dateGte", "dateLte"],
            action: true
        },
        show: {
            props: ["id", "name", "author"],
            action: true
        },
        search: {
            action: true
        },
        delete: {
            action: false
        },
    }
};
```

```js
import Factory from 'ra-component-factory';
import factoryConfig from './config/factoryConfig';
const factory = new Factory("posts", factoryConfig);
```

### Usage in Create, List, Edit, Filter and Show:

Separate fields:

```jsx
    <Edit {...props}>
        <SimpleForm>
            {factory.create("edit","id")} // this will be readonly since in edit it is denoted as _id
            {factory.create("edit","name")}
            {factory.create("edit","author")}
        </SimpleForm>
    </Edit>
```

Creation of fields all at once - based on the order of the configuration

```jsx
    <Edit title={<CompanyTitle />} {...props}>
        <SimpleForm>
            {factory.createAll("edit")}
        </SimpleForm>
    </Edit>
```


### Usage in Menu:
```jsx
{new Factory("posts", factoryConfig).canSeeMenuLink() &&
    <MenuItemLink
      key="posts"
      to={`/posts`}
      primaryText={translate(`resources.posts.name`, { smart_count: 2 })}
      leftIcon={<PostIcon color="#fff" />}
      onClick={onMenuTap}
      style={{color: "#fff"}}
    />}
```

### Rendering Action buttons (Edit/Delete/Create/Show/List) based on roles:

createCreateButton(basePath) will return empty for Create Button if the user with role1 doesn't have `create { props: [...], action: true }` in the configuration. We need to provide custom Actions in each of the components Show/Edit/List/Create to control which buttons are rendered based on roles. Note in List we don't need to provide basePath/data in the createXYZButton methods. This information is passed by their parents.

e.g for CreateButton:
```jsx
const ListActions = ({ permissions, resource, filters, displayedFilters, filterValues, basePath, showFilter, refresh }) => (
    <CardActions style={cardActionStyle}>
        {filters && factory.canFilter() && React.cloneElement(filters, { resource, showFilter, displayedFilters, filterValues, context: 'button' }) }
        {factory.createCreateButton(basePath)}
        <FlatButton primary label="refresh" onClick={refresh} icon={<NavigationRefresh />} />
    </CardActions>
);

const ShowActions = ({ resource, filters, displayedFilters, filterValues, data, basePath, showFilter, refresh }) => (
    <CardActions style={cardActionStyle}>
        {factory.createEditButton(basePath, data)}
        {factory.createListButton(basePath)}
        {factory.createDeleteButton(basePath, data)}
        <FlatButton primary label="refresh" onClick={refresh} icon={<NavigationRefresh />} />
    </CardActions>
);

const EditActions = ({ resource, filters, displayedFilters, filterValues, basePath, data, showFilter, refresh }) => (
    <CardActions style={cardActionStyle}>
        {factory.createShowButton(basePath, data)}w
        {factory.createListButton(basePath)}
        {factory.createDeleteButton(basePath, data)}
        <FlatButton primary label="refresh" onClick={refresh} icon={<NavigationRefresh />} />
    </CardActions>
);


export const PostList = (props) => (
    <List title="All posts" {...props} filters={<PostFilter/>} actions={<ListActions />} sort={{field: 'id', order: 'DESC'}} perPage={5}>
        <Datagrid>
        {factory.createAll("list")}
        {factory.createShowButton()}
        {factory.createEditButton()}
        {factory.createDeleteButton()}
        </Datagrid>
    </List>
    );


export const PostEdit = (props) => (
    <Edit actions={<EditActions/>}  title={<PostTitle />} {...props}>
        <SimpleForm redirect={false}>
            {factory.createAll("edit")}
        </SimpleForm>
    </Edit>
);

export const PostCreate = (props) => (
    <Create {...props}>
        <SimpleForm redirect="list">
            {factory.createAll("create")}
        </SimpleForm>
    </Create>
);

export const PostShow = (props) => (
    <Show  actions={<ShowActions/>}  {...props}>
        <SimpleShowLayout>
            {factory.createAll("show")}
        </SimpleShowLayout>
    </Show>
);
```

### Hide properties

If you want to hide a property of a resource from list for a secific role (e.g role1) you just remove it from its internal `props` array. The same can be done for create, edit and filter.

### Readonly properties in Edit Mode:

if you want a property to be readonly in Edit Mode you prefix it with "_" or whatever prefix you have configured at `factoryConfig.editReadOnlyStartsWith`

### Global Text Search q

if you want to have Search in all fields of a resource, you just add "q" in the filter props

### Tabs

if you want to have tabbed forms `Edit`/`Create` or tabbed `Show` layout you add tab delimiters `'-----TAB-----'` or whatever is configured in `factoryConfig.tabDelimiter` as a property in actions create, edit or show.

```js
{
  role1: {
      create: {
         props: ["name", "author", "-----TAB-----", "date"],
	 tabs: ["Sample Tab 1", "Sample Tab 2"],
         action: true
      },
      [...]
  },

  role2: {
      create: {
         props: ["name", "-----TAB-----", "author", "-----TAB-----", "date"],
	 tabs: ["Sample Tab 1", "Sample Tab 2", "Sample Tab 3"],
         action: true
      },
      [...]
  },

  [...]
}
```

```jsx
<Create {...props}>
   <TabbedForm>
       {factory.createAll("create")}
    </TabbedForm>
</Create>
```
This will put inputs `name` and `author` in the first `Tab` and `date` in the second `FormTab` for `role1` users.
It will put input `name` in the first `FormTab`, `author` in the second `FormTab` and `date` in the third `FormTab` for `role2` users.

if tabs is missing from the configuration - the default labels "Tab 1", "Tab 2", "Tab 3" will show up

Similarly for Show:

```jsx
<Show {...props}>
  <TabbedShowLayout>
       {factory.createAll("show")}
    </TabbedShowLayout>
</Show>
```

Make sure you either have tabs for a specific action (factory call is in `TabbedForm` or `TabbedShowLayout` component) for all roles or you don't 

In case a role doesn't need  Tabs you need to at least have one "dummy/empty title" tab which can be configured like this: 

```
  role2: {
      create: {
         props: ["name",  "author", "date", "-----TAB-----"],
	 tabs: [""],
         action: true
      },
      [...]
  },
```

### Responsive configuration

Coming soon


## License

This translation is licensed under the [MIT Licence](LICENSE).