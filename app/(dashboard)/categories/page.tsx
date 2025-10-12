import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getCategoriesByUser } from "@/lib/db/queries/categories";
import { authOptions } from "@/lib/auth/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AddCategoryDialog from "@/components/categories/add-category-dialog";

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const allCategories = await getCategoriesByUser(session.user.id);

  // Separate parent and child categories
  const parentCategories = allCategories.filter((c: any) => !c.parent_id);
  const childCategories = allCategories.filter((c: any) => c.parent_id);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <AddCategoryDialog categories={allCategories} />
      </div>

      <div className="space-y-6">
        {/* Income Categories */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Income Categories</h2>
          <div className="grid gap-3">
            {parentCategories
              .filter((c: any) => c.type === "income")
              .map((parent: any) => {
                const children = childCategories.filter((c: any) => c.parent_id === parent.id);
                return (
                  <Card key={parent.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{parent.icon}</span>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{parent.name}</CardTitle>
                          <Badge variant="default" className="mt-1">Income</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    {children.length > 0 && (
                      <CardContent>
                        <div className="pl-8 space-y-2">
                          {children.map((child: any) => (
                            <div key={child.id} className="flex items-center gap-2 text-sm">
                              <span>{child.icon}</span>
                              <span>{child.name}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
          </div>
        </div>

        {/* Expense Categories */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Expense Categories</h2>
          <div className="grid gap-3">
            {parentCategories
              .filter((c: any) => c.type === "expense")
              .map((parent: any) => {
                const children = childCategories.filter((c: any) => c.parent_id === parent.id);
                return (
                  <Card key={parent.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{parent.icon}</span>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{parent.name}</CardTitle>
                          <Badge variant="destructive" className="mt-1">Expense</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    {children.length > 0 && (
                      <CardContent>
                        <div className="pl-8 space-y-2">
                          {children.map((child: any) => (
                            <div key={child.id} className="flex items-center gap-2 text-sm">
                              <span>{child.icon}</span>
                              <span>{child.name}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
          </div>
        </div>
      </div>

      {allCategories.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No categories yet</p>
            <AddCategoryDialog categories={[]} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}