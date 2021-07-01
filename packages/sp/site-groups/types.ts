import {
    _OLD_SharePointQueryableInstance,
    _OLD_SharePointQueryableCollection,
    OLD_spInvokableFactory,
} from "../sharepointqueryable.js";
import { SiteUsers, ISiteUsers } from "../site-users/types.js";
import { assign, ITypedHash, hOP } from "@pnp/core";
import { metadata } from "../utils/metadata.js";
import { body } from "@pnp/queryable";
import { defaultPath } from "../decorators.js";
import { OLD_spPost } from "../operations.js";
import { tag } from "../telemetry.js";

@defaultPath("sitegroups")
export class _SiteGroups extends _OLD_SharePointQueryableCollection<ISiteGroupInfo[]> {

    /**
     * Gets a group from the collection by id
     *
     * @param id The id of the group to retrieve
     */
    public getById(id: number): ISiteGroup {
        return tag.configure(SiteGroup(this).concat(`(${id})`), "sgs.getById");
    }

    /**
     * Adds a new group to the site collection
     *
     * @param properties The group properties object of property names and values to be set for the group
     */
    public async add(properties: ITypedHash<any>): Promise<IGroupAddResult> {

        const postBody = body(assign(metadata("SP.Group"), properties));

        const data = await OLD_spPost(tag.configure(this, "sgs.add"), postBody);
        return {
            data,
            group: this.getById(data.Id),
        };
    }

    /**
     * Gets a group from the collection by name
     *
     * @param groupName The name of the group to retrieve
     */
    public getByName(groupName: string): ISiteGroup {
        return tag.configure(SiteGroup(this, `getByName('${groupName}')`), "sgs.getByName");
    }

    /**
     * Removes the group with the specified member id from the collection
     *
     * @param id The id of the group to remove
     */
    @tag("sgs.removeById")
    public removeById(id: number): Promise<void> {
        return OLD_spPost(this.clone(SiteGroups, `removeById('${id}')`));
    }

    /**
     * Removes the cross-site group with the specified name from the collection
     *
     * @param loginName The name of the group to remove
     */
    @tag("sgs.removeByLoginName")
    public removeByLoginName(loginName: string): Promise<any> {
        return OLD_spPost(this.clone(SiteGroups, `removeByLoginName('${loginName}')`));
    }
}
export interface ISiteGroups extends _SiteGroups {}
export const SiteGroups = OLD_spInvokableFactory<ISiteGroups>(_SiteGroups);

export class _SiteGroup extends _OLD_SharePointQueryableInstance<ISiteGroupInfo> {

    /**
     * Gets the users for this group
     *
     */
    public get users(): ISiteUsers {
        return tag.configure(SiteUsers(this, "users"), "sg.users");
    }

    /**
     * Updates the group with the given property values
     *
     * @param props The group properties object of property names and values to be set for the group
     */
    public update = this._update<IGroupUpdateResult, ITypedHash<any>>("SP.Group", (d, p) => {

        const retGroup: ISiteGroup = hOP(p, "Title") ? this.getParent(SiteGroup, this.parentUrl, `getByName('${p.Title}')`) : SiteGroup(this);

        return {
            data: d,
            group: retGroup,
        };
    });

    /**
     * Set the owner of a group using a user id
     * @param userId the id of the user that will be set as the owner of the current group
     */
    @tag("sg.setUserAsOwner")
    public setUserAsOwner(userId: number): Promise<any> {
        return OLD_spPost(this.clone(SiteGroup, `SetUserAsOwner(${userId})`));
    }
}
export interface ISiteGroup extends _SiteGroup {}
export const SiteGroup = OLD_spInvokableFactory<ISiteGroup>(_SiteGroup);

/**
 * Result from updating a group
 *
 */
export interface IGroupUpdateResult {
    group: ISiteGroup;
    data: any;
}

/**
 * Results from adding a group
 *
 */
export interface IGroupAddResult {
    group: ISiteGroup;
    data: any;
}

export interface ISiteGroupInfo {
    AllowMembersEditMembership: boolean;
    AllowRequestToJoinLeave: boolean;
    AutoAcceptRequestToJoinLeave: boolean;
    Description: string;
    Id: number;
    IsHiddenInUI: boolean;
    LoginName: string;
    OnlyAllowMembersViewMembership: boolean;
    OwnerTitle: string;
    PrincipalType: number;
    RequestToJoinLeaveEmailSetting: string | null;
    Title: string;
}
