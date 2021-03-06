-- migrate:up
create table "Member" (
    "ID" bigint generated always as identity not null,
    "Email" varchar(254) unique not null,
    "FirstName" text,
    "LastName" text,
    "Password" text not null,
    "PasswordType" text not null,
    primary key("ID"),
    constraint "PasswordType_Validation" CHECK ("PasswordType" IN ('bcrypt'))
);

create table "Permission" (
    "ID" integer generated always as identity not null,
    "Name" text,
    "Type" text,
    primary key("ID"),
    constraint "Type_Unique" unique ("Type")
);

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
