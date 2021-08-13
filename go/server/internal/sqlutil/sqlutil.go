package sqlutil

import (
	"reflect"
)

func GetDBFieldList(el interface{}) string {
	var list string
	walkDBFields(reflect.TypeOf(el).Elem(), func(name string) {
		if list != "" {
			list += `, "` + name + `"`
			return
		}
		list += `"` + name + `"`
	})
	return list
}

func GetDBInterpolateList(el interface{}) string {
	var list string
	walkDBFields(reflect.TypeOf(el).Elem(), func(name string) {
		if list != "" {
			list += ", :" + name
			return
		}
		list += ":" + name
	})
	return list
}

// walkDBFields gets each struct field tagged with `db`, including embedded structs
//
// ie.
// sqlutil.walkDBFields(reflect.ValueOf(&YourStruct{}).Elem(), func(fieldValue reflect.Value, name string) {
//	list = append(list, name)
// })
//
func walkDBFields(el reflect.Type, callback func(name string)) {
	for i := 0; i < el.NumField(); i++ {
		structField := el.Field(i)
		fieldType := structField.Type
		if structField.Anonymous {
			if fieldType.Kind() == reflect.Struct {
				walkDBFields(fieldType, callback)
				continue
			}
			if fieldType.Kind() == reflect.Ptr && fieldType.Elem().Kind() == reflect.Struct {
				walkDBFields(fieldType.Elem(), callback)
				continue
			}
		}
		if tag, ok := structField.Tag.Lookup("db"); ok {
			callback(tag)
		}
	}
}
