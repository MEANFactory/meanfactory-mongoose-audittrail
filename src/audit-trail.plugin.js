/* jshint -W101 */

var $           = require('mf-utils-node'),
    mongoose    = require('mongoose');

module.exports = function (schema, options) {

    options = options || {};
    setOptions(options);

    if (!schema.path(options.created.path) && options.created.use !== false) {

        var createdPath = options.created.path;
        delete options.created.path;
        delete options.created.use;

        var createdNode = {};
        createdNode[createdPath] = options.created;
        schema.add(createdNode);
    }

    if (!schema.path(options.updated.path) && options.updated.use !== false) {

        var updatedPath = options.updated.path;
        delete options.updated.path;
        delete options.updated.use;

        var updatedNode = {};
        updatedNode[updatedPath] = options.updated;
        schema.add(updatedNode);

        schema.pre('save', function(next){
            if (!this.isNew) {
                this[updatedPath] = new Date();
            }
            return next();
        });
    }

    if (!schema.path(options.member.path) && options.member.use !== false) {

        var memberPath = options.member.path;
        delete options.member.path;
        delete options.member.use;

        var memberNode = {};
        memberNode[memberPath] = options.member;
        schema.add(memberNode);

        if ($.uuids.isValidUidType(options.member.uuid)) {
            schema.path(memberPath).validate(function(v, fn){
                if (options.member.uuid === 'uid') {
                    return $.uuids.isValidUid(v);
                } else {
                    return $.uuids.isValidV4(v);
                }
            }, getName(memberPath, options) + ' is not a valid identifier: {VALUE}');
        }
    }
};

function getName (pathName, options) {
    options = options || {};
    return $.strings.isValid(options.name) ? options.name.trim() : pathName;
}

function setOptions (options) {

    var _defaults = {
        created : {
            default     : Date.now,
            required    : true,
            type        : Date,
            key         : 'audit.created',
            hide        : undefined,
            name        : 'Created Date',
            path        : 'ac',
            show        : undefined,
            auditType   : 'CREATED',
        },
        updated : {
            type        : Date,
            key         : 'audit.updated',
            hide        : undefined,
            name        : 'Updated Date',
            path        : 'au',
            show        : undefined,
            auditType   : 'UPDATED'
        },
        member : {
            required    : true,
            type        : mongoose.Schema.ObjectId,
            key         : 'audit.member',
            hide        : undefined,
            name        : 'Audit Member',
            path        : 'am',
            show        : undefined,
            trim        : undefined,
            uppercase   : undefined,
            uuid        : undefined,
            auditType   : 'MEMBER'
        }
    };

    options.created             = options.created || {};
    options.created.auditType   = _defaults.created.auditType;
    options.created.default     = $.objects.ifUndefined(options.created.default, _defaults.created.default);
    options.created.required    = $.objects.ifUndefined(options.created.required, _defaults.created.required);
    options.created.type        = $.objects.ifUndefined(options.created.type, _defaults.created.type);
    options.created.key         = $.objects.ifUndefined(options.created.key, _defaults.created.key);
    options.created.hide        = $.numbers.isValidOperation(options.created.hide, _defaults.created.hide);
    options.created.name        = $.objects.ifUndefined(options.created.name, _defaults.created.name);
    options.created.path        = $.objects.ifUndefined(options.created.path, _defaults.created.path);
    options.created.show        = $.numbers.isValidOperation(options.created.show, _defaults.created.show);

    options.updated             = options.updated || {};
    options.updated.auditType   = _defaults.updated.auditType;
    options.updated.type        = $.objects.ifUndefined(options.updated.type, _defaults.updated.type);
    options.updated.key         = $.objects.ifUndefined(options.updated.key, _defaults.updated.key);
    options.updated.hide        = $.numbers.isValidOperation(options.updated.hide, _defaults.updated.hide);
    options.updated.name        = $.objects.ifUndefined(options.updated.name, _defaults.updated.name);
    options.updated.path        = $.objects.ifUndefined(options.updated.path, _defaults.updated.path);
    options.updated.show        = $.numbers.isValidOperation(options.updated.show, _defaults.updated.show);

    options.member              = options.member || {};
    options.member.auditType    = _defaults.member.auditType;
    options.member.required     = $.objects.ifUndefined(options.member.required, _defaults.member.required);
    options.member.type         = $.objects.ifUndefined(options.member.type, ($.uuids.isValidUidType(options.member.uuid) ? String : _defaults.member.type));
    options.member.key          = $.objects.ifUndefined(options.member.key, _defaults.member.key);
    options.member.hide         = $.numbers.isValidOperation(options.member.hide, _defaults.member.hide);
    options.member.name         = $.objects.ifUndefined(options.member.name, _defaults.member.name);
    options.member.path         = $.objects.ifUndefined(options.member.path, _defaults.member.path);
    options.member.trim         = $.objects.ifUndefined(options.member.trim, ($.uuids.isValidUidType(options.member.uuid) ? true : _defaults.member.trim));
    options.member.uppercase    = $.objects.ifUndefined(options.member.uppercase, ($.uuids.isValidUidType(options.member.uuid) ? true : _defaults.member.uppercase));
    options.member.show         = $.numbers.isValidOperation(options.member.show, _defaults.member.show);
    options.member.uuid         = $.objects.ifUndefined(options.member.uuid, _defaults.member.uuid);

}
