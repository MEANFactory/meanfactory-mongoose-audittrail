# mf-mongoose-audittrail
Track dates and users of every create or update operation. Compare versions of documents.

## Installation ##

    npm install --save mf-mongoose-audittrail

## Features ##

### Auditing ###
- Add audit fields to schemas with one line of code
- Track date created, date update, or both
- Track user ID of the responsible operation
- Compare / contract version differences (coming soon)

### DTO Compatibility ###
- Designed to work with [mf-mongoose-dto](https://github.com/MEANFactory/mf-mongoose-dto) plugin
- Automatically hide / show audit fields based on user rights


### Soft Delete Compatibility ###
- Designed to work with [mf-mongoose-softdelete](https://github.com/MEANFactory/mf-mongoose-softdelete) plugin
- Increase data integrity by retaining deleted data
- Retain historical data
- Flag objects as "deleted"
- Automatically remove deleted data from result sets
- Manually find or count data with or without deleted items


## Settings & Defaults ##
No additional coding is required besides adding the plugin to the schema.  However, the defaults may be overridden to alter the functionality of the plugin.  This is done by supplying a JSON object in the following hierarchy to the plugin while attaching it to the schema:

	{
	    created : {
	        use         : true,                    // set to false to disable
	        key         : 'audit.created',         // used by mf-mongoose-dto plugin
	        hide        : undefined,               // used by mf-mongoose-dto plugin
	        name        : 'Created Date',          // used by mf-mongoose-dto plugin
	        path        : 'ac',                    // actual path in schema
	        show        : undefined                // used by mf-mongoose-dto plugin
	    },
	    updated : {
	        use         : true,
	        key         : 'audit.updated',
	        hide        : undefined,
	        name        : 'Updated Date',
	        path        : 'au',
	        show        : undefined
	    },
	    member : {
	        use         : true,
	        default     : undefined,                // generally used while seeding your database
	        type        : Schema.ObjectId,          // override the data type or use uuid setting
	        key         : 'audit.member',
	        hide        : undefined,
	        name        : 'Audit Member',
	        path        : 'am',
	        show        : undefined,
	        uuid        : undefined                 // flags data type as UUID (uid, v1, v4)
	    }
	}

**Note:**  
If desired, you may use UUID values for the Audit Member ID field by setting the `uuid:` property.  Valid options are `'uid'`, `'v1'`, and, `'v4'`.  Setting this value will automatically change the dependent parameters within the schema (type, etc.).  For example:

    {
        member : {
            uuid : 'v4'
        }
    }




## Example #1: Basic Usage ##
Date Created and Date Updated are added automatically.  Member ID may be added by default or passed in.

### Logic ###
In the example below we are seeding the database.  The optional (extended) Unique Identifier type is supplied along with the ID of the System Administrator user.  None fo the values in the audit fields (`ac`, `au`, or `am`) were supplied after the creation of the schema.

### Schema ###
```
var mongoose = require('mongoose'),
    mfAudit = require('mf-mongoose-audittrail'),
	enums    = require('../enums');

var personSchema = mongoose.Schema({

    s   : { type: String, name: 'SSN'  },

    p   : { type: String },
    f   : { type: String },
    m   : { type: String, name: 'Middle Name', key: 'name.middle' },
    l   : { type: String, name: 'Last Name', key: 'name.last' },

    bm  : { type: Number, name: 'Birth Month', key: 'dob.month' },
    bd  : { type: Number, name: 'Birth Day', key: 'dob.day' },
    by  : { type: Number, name: 'Birth Year', key: 'dob.year' }
});

personSchema.plugin(mfAudit, {
	member: {
	    uuid    : 'uid',
   		default : '40B30547A8F748EC91D57A95749E0112'
	}
);

module.exports = mongoose.model('Person', personSchema);
```

### Result: ###

```
{
    s : '123-45-6789',

    p : 'MR'
    f : 'Joe',
    m : 'Dweezil',
    l : 'Blow',

    bm : 12,
    bd : 31,
    by : 2000,

    ac : Fri Aug 19 2016 15:35:23 GMT-0400 (EDT),   // Date Created
    au : Fri Aug 19 2016 19:14:03 GMT-0400 (EDT),   // Date Modified
    am : '40B30547A8F748EC91D57A95749E0112'         // Responsible User ID
}
```






## Example #2: Basic Usage + the DTO Plugin) ##
Adding the [mf-mongoose-dto](https://github.com/MEANFactory/mf-mongoose-dto) plugin allows for the output of the `toJSON()` call to be prepared for user-facing application usage.

### Logic ###
Adding the [mf-mongoose-dto](https://github.com/MEANFactory/mf-mongoose-dto) plugin extends the capabilities of the [mf-mongoose-audittrail](https://github.com/MEANFactory/mf-mongoose-audittrail) plugin for a more cosmetically pleasing and human-readable presentation.

### Schema ###
```
var mongoose = require('mongoose'),
    mfAudit = require('mf-mongoose-audittrail'),
	mfDto   = require('mf-mongoose-dto'),
    enums    = require('../enums');

var GUEST = 10,
    USER  = 20,
    OWNER = 30,
    ADMIN = 40;

var personSchema = mongoose.Schema({

    s   : { type: String, name: 'SSN'  },

    p   : { type: String, name: 'Prefix', enums: enums.NamePrefix.ids },
    f   : { type: String, name: 'First Name', key: 'name.first' },
    m   : { type: String, name: 'Middle Name', key: 'name.middle' },
    l   : { type: String, name: 'Last Name', key: 'name.last' },

    bm  : { type: Number, name: 'Birth Month', key: 'dob.month' },
    bd  : { type: Number, name: 'Birth Day', key: 'dob.day' },
    by  : { type: Number, name: 'Birth Year', key: 'dob.year' }
});

personSchema.plugin(mfAudit, {
	created: {
	    hide : '< ' + USER
	}
	updated: {
	    hide : '< ' + USER
	}
	member: {
	    uuid     : 'uid',
   		 default : '40B30547A8F748EC91D57A95749E0112',
   		 show    : '>= ' + USER
	}
);
personSchema.plugin(mfDto);

module.exports = mongoose.model('Person', personSchema);
```
### Usage ###
```
var result = person.toJSON({
    hide  : '_id',
    show  : ['bd', 'by'],
    level : USER
});
```
### Result: ###

```
{
    prefix : {
        id : 'MR'
    },
    name : {
        first  : 'Joe',
        middle : 'Dweezil'
    },
    dob  : {
        month : 12,
        day   : 31,
        year  : 2000
    },
    audit : {
    	member  : '40B30547A8F748EC91D57A95749E0112'
    }
}
```
### Explanation: ###
1. The Audit Fields are build out in a more human-readable hierarchy.
1. Some fields are hidden by the [mf-mongoose-dto](https://github.com/MEANFactory/mf-mongoose-dto) plugin because the `hide` and `show` settings passed into the plugin when it was added to the schema.
1. Other fields in the document were automatically hidden by the [mf-mongoose-dto](https://github.com/MEANFactory/mf-mongoose-dto) plugin because of the `hide` and `show` parameters added to the schema.





## Database Seeding ##
Remember to set the `audit.member` identifier field when seeding your database.  When using the default settings, the key for this field is `am:`.  For example:  

```
var seedMemberId = '49031586161143F5AB37AD809538A5CE';

module.exports = {
    items: [
        {
            t: 'E',
            i: 'support@spotless.cc',
            p: [
                { k: 'name', v: 'Spotless Software LLC', am: seedMemberId }
            ],
            am: seedMemberId
        },
        {
            t: 'E',
            i: 'fred.lackey@spotless.cc',
            p: [
                { k: 'name', v: 'MEAN Factory', am: seedMemberId }
            ],
            am: seedMemberId
        }
    ]
};
```
You may also want to override the the `type:` setting for the `audit.member` field.  The example above uses the `'uid'` identifier type, so the plugin settings for this would be:  

```
var externalProfileSchema = new mongoose.Schema({

    _id : String,

    t   : String,
    i   : String,

    p   : { type: [ propertySchema ] }

});
externalProfileSchema.plugin(mfAuditTrail, {
    member: {
        uuid: 'uid'
    }
});

module.exports = mongoose.model('ExternalProfile', externalProfileSchema);
```

the `type:`






## Related Projects ##
The following projects have been designed specifically to work with each other:

### [mf-mongoose-audittrail](https://github.com/MEANFactory/mf-mongoose-audittrail) (this plugin) ###
Track who and when documents are created and updated without complex programming.  Compare and contract different versions of each document.

### [mf-mongoose-dto](https://github.com/MEANFactory/mf-mongoose-dto) ###
Convert to/from JSON DTO while applying optional level-based hiding.

### [mf-mongoose-softdelete](https://github.com/MEANFactory/mf-mongoose-softdelete) ###
Increase data integrity by retaining historical data and preventing data from being permanently deleted.  Each `delete` operation causes the document to be marked as "deleted" and subsequently hidden from result sets.

### [mf-mongoose-validate](https://github.com/MEANFactory/mf-mongoose-validate) ###
Provides additional validation for extended data types, field lengths, arrays, and other useful features.


## Contact Information ##
MEAN Factory  
[support@meanfactory.com](mailto:support@meanfactory.com)  
[www.MEANFactory.com](http://www.MEANFactory.com)  
