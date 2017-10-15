[![npm](https://img.shields.io/npm/dw/aor-embedded-array.svg)](https://www.npmjs.com/package/ra-component-factory)
[![npm](https://img.shields.io/npm/v/aor-embedded-array.svg)](https://www.npmjs.com/package/ra-component-factory)
[![npm](https://img.shields.io/npm/l/aor-embedded-array.svg)](https://www.npmjs.com/package/ra-component-factory)

# ra-component-factory

react-admin component-factory provides a centralized way to easily configure:
- permissions on action buttons (should a CreateButton be visible ?)
- permissions on Forms/Actions (should edit form of a resource be accessible to a user?)
- permissions on Menu Links (should a Menu Link be visible ?)
- permissions on front-end visibility/immutability (should a property be visible / readonly ?)
- reordering of elements in the views
- handling of tabbed views/forms
- (soon) mobile responsive view integration

### Installation:

Add `"ra-component-factory": "0.1.5"` in your package.json and run `npm install`

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
} from 'admin-on-rest';

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
            props: ["name", "author, "date"],
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

### Creating Edit/Delete/Create/Show buttons:

It will return empty for create Button if the user with role1 doesn't have `create { props: [...], action: true }` in the configuration

e.g for CreateButton:
```jsx
    <CardActions style={cardActionStyle}>
        {filters && factory.canFilter() && React.cloneElement(filters, { resource, showFilter, displayedFilters, filterValues, context: 'button' }) }
        {factory.createCreateButton(basePath)}
        <FlatButton primary label="refresh" onClick={refresh} icon={<NavigationRefresh />} />
    </CardActions>
```

e.g in List:
```jsx
<List title="All posts" {...props} filters={<PostFilter/>} actions={<Actions />} sort={{field: 'id', order: 'DESC'}} perPage={5}>
    <Datagrid>
       {factory.createAll("list"}
       {factory.createShowButton()}
       {factory.createEditButton()}
       {factory.createDeleteButton()}
    </Datagrid>
</List>
```

### Hide properties

If you want to hide a property of a resource from list for a secific role (e.g role1) you just remove it from its internal `props` array. The same can be done for create, edit and filter.

### Readonly properties in Edit Mode:

if you want a property to be readonly in Edit Mode you prefix it with "_" or whatever prefix you have configured at `factoryConfig.editReadOnlyStartsWith`

### Global Text Search q 

if you want to have Search in all fields of a resource, you just add "q" in the filter props

### Tabs 

if you want to have tabbed forms or tabbed show layout you add tab delimiters `'-----TAB-----'` or whatever is configured in `factoryConfig.tabDelimiter` as a property (make sure you are consistent about the number of tabs for all roles of the specific action):

```js
{
  role1: {
      create: {
         props: ["name", "author", "-----TAB-----", "date"],
         action: true
      },
      [...]
  },

  role2: {
      create: {
         props: ["name", "-----TAB-----", "author", "date"],
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
       <FormTab label="Sample Tab">
       {factory.createAll("create",0)}
       </FormTab>
       <FormTab label="Sample Tab 2">
       {factory.createAll("create",1)}
       </FormTab>
    </TabbedForm>
</Create>
```    
This will put inputs `name` and `author` in the first `Tab` and `date` in the second `Tab` for `role1` users.
It will put input `name` in the first `Tab` and `author`,`date` in the second `Tab` for `role2` users.
 