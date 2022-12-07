-- migrate:up
create table "Member" (
    "ID" bigint generated always as identity not null,
    "Email" varchar(254) unique not null,
    "FirstName" text,
    "LastName" text,
    "Password" text not null,
    "PasswordType" text not null,
    primary key("ID"),
    constraint "PasswordType_Validation" CHECK ("PasswordType" IN ('bcrypt')),
    constraint "Email_Unique" unique ("Email")
);

-- migrate:down

drop table "Member";
