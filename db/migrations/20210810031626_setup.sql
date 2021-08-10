-- migrate:up
create table "Member" (
    "ID" bigint generated always as identity not null,
    "Email" text not null,
    "FirstName" text,
    "LastName" text,
    "Password" text not null,
    "PasswordType" text not null,
    primary key("ID")
);

create table "Permission" (
    "ID" integer generated always as identity not null,
    "Name" text,
    "Type" text,
    primary key("ID")
);

create unique index "type_idx" on "Permission"("Type");

create table "Member_Permission" (
    "MemberID" bigint,
    "PermissionID" integer,
    primary key("MemberID","PermissionID"),
    constraint MemberID_FK foreign key("MemberID") references "Member"("ID"),
    constraint PermissionID_FK foreign key("PermissionID") references "Permission"("ID")
);

INSERT INTO "Permission" ("Name", "Type") VALUES
('Administrator', 'admin')

-- migrate:down

delete from "Permission" WHERE "Type" IN ('admin');
drop table "Member_Permission";
drop table "Permission";
drop table "Member";
