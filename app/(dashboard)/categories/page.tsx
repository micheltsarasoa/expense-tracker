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
        <h1 className="text-2xl font-semibold text-foreground">Categories</h1>
        <AddCategoryDialog categories={allCategories} />
      </div>

      <div className="space-y-6">
        {/* Income Categories */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-foreground">Income Categories</h2>
          <div className="grid gap-3">
            {parentCategories
              .filter((c: any) => c.type === "income")
              .map((parent: any) => {
                const children = childCategories.filter((c: any) => c.parent_id === parent.id);
                return (
                  <Card key={parent.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-2xl">
                          {parent.icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base font-semibold">{parent.name}</CardTitle>
                          <Badge variant="default" className="mt-1 bg-green-500/10 text-green-600 dark:text-green-500 border-0">Income</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    {children.length > 0 && (
                      <CardContent>
                        <div className="pl-8 space-y-2">
                          {children.map((child: any) => (
                            <div key={child.id} className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                              <span>{child.icon}</span>
                              <span className="text-foreground">{child.name}</span>
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
          <h2 className="text-lg font-semibold mb-3 text-foreground">Expense Categories</h2>
          <div className="grid gap-3">
            {parentCategories
              .filter((c: any) => c.type === "expense")
              .map((parent: any) => {
                const children = childCategories.filter((c: any) => c.parent_id === parent.id);
                return (
                  <Card key={parent.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center text-2xl">
                          {parent.icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base font-semibold">{parent.name}</CardTitle>
                          <Badge variant="destructive" className="mt-1 bg-red-500/10 text-red-600 dark:text-red-500 border-0">Expense</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    {children.length > 0 && (
                      <CardContent>
                        <div className="pl-8 space-y-2">
                          {children.map((child: any) => (
                            <div key={child.id} className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                              <span>{child.icon}</span>
                              <span className="text-foreground">{child.name}</span>
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
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No categories yet</p>
            <AddCategoryDialog categories={[]} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}